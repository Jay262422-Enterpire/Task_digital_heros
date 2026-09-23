"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PLANS } from "@/lib/config";
import { addCadence } from "@/lib/money";
import { refreshSubscriptionStatus } from "@/lib/subscriptions";
import { getStripe, priceIdForPlan, stripeConfigError } from "@/lib/stripe";
import { publicAppUrl } from "@/lib/app-url";

export type SubState = { error?: string; success?: string };

export async function subscribeAction(
  _prev: SubState,
  formData: FormData
): Promise<SubState> {
  const session = await getSession();
  if (!session) return { error: "Create an account before subscribing." };
  if (session.role === "ADMIN") return { error: "Admin accounts do not subscribe." };

  const planId = String(formData.get("plan"));
  const plan = planId === "YEARLY" ? PLANS.YEARLY : planId === "MONTHLY" ? PLANS.MONTHLY : null;
  if (!plan) return { error: "Choose a monthly or yearly plan." };

  const existing = await refreshSubscriptionStatus(session.id);
  if (existing?.status === "ACTIVE") {
    return { error: "You already have an active subscription." };
  }

  const configError = stripeConfigError();
  if (configError) return { error: configError };

  const priceId = priceIdForPlan(plan.id);
  if (!priceId) return { error: stripeConfigError() ?? "Stripe price is missing." };

  const origin = await publicAppUrl();
  let checkoutUrl: string | null = null;
  try {
    const checkout = await getStripe().checkout.sessions.create({
      mode: "subscription",
      client_reference_id: session.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe?canceled=1`,
      metadata: { userId: session.id, plan: plan.id },
      subscription_data: {
        metadata: { userId: session.id, plan: plan.id },
      },
      ...(existing?.stripeCustomerId
        ? { customer: existing.stripeCustomerId }
        : { customer_email: session.email }),
    });
    checkoutUrl = checkout.url;
  } catch (error) {
    console.error("subscribeAction checkout.sessions.create failed", error);
    return {
      error:
        "Could not start Stripe Checkout. No payment was taken and no plan was activated.",
    };
  }

  if (!checkoutUrl) {
    return {
      error: "Stripe did not return a checkout URL. No payment was taken and no plan was activated.",
    };
  }

  redirect(checkoutUrl);
}

export async function cancelSubscriptionAction(): Promise<SubState> {
  const session = await getSession();
  if (!session) return { error: "Sign in to continue." };
  const sub = await refreshSubscriptionStatus(session.id);
  if (!sub || sub.status !== "ACTIVE") {
    return { error: "There is no active subscription to cancel." };
  }

  if (sub.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) {
    try {
      await getStripe().subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      console.error("cancelSubscriptionAction stripe update failed", error);
      return { error: "Stripe could not schedule the cancellation. Your plan is still active." };
    }
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { canceledAt: new Date() },
  });
  revalidatePath("/dashboard");
  return {
    success: `Cancellation scheduled. You stay in draws until ${sub.renewalDate.toLocaleDateString("en-GB")}.`,
  };
}

export async function adminSetSubscriptionAction(
  _prev: SubState,
  formData: FormData
): Promise<SubState> {
  const session = await getSession();
  if (session?.role !== "ADMIN") return { error: "Administrator access required." };

  const userId = String(formData.get("userId"));
  const status = String(formData.get("status"));
  const planId = String(formData.get("plan"));
  if (!["ACTIVE", "CANCELED", "LAPSED", "INACTIVE"].includes(status)) {
    return { error: "Unknown subscription status." };
  }
  const plan = planId === "YEARLY" ? PLANS.YEARLY : PLANS.MONTHLY;
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  const now = new Date();
  const data = {
    plan: plan.id,
    status,
    amountPence: plan.amountPence,
    renewalDate: status === "ACTIVE" ? addCadence(now, plan.id) : existing?.renewalDate ?? now,
    canceledAt: status === "CANCELED" ? now : null,
    mockPaymentId: existing?.mockPaymentId ?? `admin_${Date.now()}`,
  };
  if (existing) {
    await prisma.subscription.update({ where: { id: existing.id }, data });
  } else {
    await prisma.subscription.create({ data: { userId, ...data } });
  }
  revalidatePath("/admin/users");
  return { success: "Subscription updated." };
}
