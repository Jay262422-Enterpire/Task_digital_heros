"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PLANS } from "@/lib/config";
import { addCadence } from "@/lib/money";
import { refreshSubscriptionStatus } from "@/lib/subscriptions";

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

  const now = new Date();
  const payload = {
    plan: plan.id,
    status: "ACTIVE",
    amountPence: plan.amountPence,
    renewalDate: addCadence(now, plan.id),
    canceledAt: null,
    mockPaymentId: `mock_${plan.id.toLowerCase()}_${Date.now()}`,
  };

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    await prisma.subscription.create({
      data: { userId: session.id, ...payload },
    });
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?subscribed=1");
}

export async function cancelSubscriptionAction(): Promise<SubState> {
  const session = await getSession();
  if (!session) return { error: "Sign in to continue." };
  const sub = await refreshSubscriptionStatus(session.id);
  if (!sub || sub.status !== "ACTIVE") {
    return { error: "There is no active subscription to cancel." };
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
