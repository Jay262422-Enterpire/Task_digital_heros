import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { planAmountPence } from "@/lib/stripe";
import { addCadence } from "@/lib/money";
import {
  mapStripeSubscriptionStatus,
  periodEndFromSubscription,
  planFromSubscription,
  shouldActivateCheckout,
  stripeObjectId,
  type MappedSubStatus,
} from "@/lib/stripe-map";

export async function resolveUserId(params: {
  userId?: string | null;
  clientReferenceId?: string | null;
  customerId?: string | null;
  email?: string | null;
}): Promise<string | null> {
  if (params.userId) {
    const user = await prisma.user.findUnique({ where: { id: params.userId }, select: { id: true } });
    if (user) return user.id;
  }
  if (params.clientReferenceId) {
    const user = await prisma.user.findUnique({
      where: { id: params.clientReferenceId },
      select: { id: true },
    });
    if (user) return user.id;
  }
  if (params.customerId) {
    const byCustomer = await prisma.subscription.findFirst({
      where: { stripeCustomerId: params.customerId },
      select: { userId: true },
    });
    if (byCustomer) return byCustomer.userId;
  }
  if (params.email) {
    const user = await prisma.user.findUnique({
      where: { email: params.email.toLowerCase() },
      select: { id: true },
    });
    if (user) return user.id;
  }
  return null;
}

export async function upsertFromStripe(params: {
  userId: string;
  plan: "MONTHLY" | "YEARLY";
  status: MappedSubStatus;
  renewalDate: Date;
  canceledAt: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  mockPaymentId: string;
}): Promise<void> {
  const existing = await prisma.subscription.findUnique({ where: { userId: params.userId } });
  const data = {
    plan: params.plan,
    status: params.status,
    amountPence: planAmountPence(params.plan),
    renewalDate: params.renewalDate,
    canceledAt: params.canceledAt,
    mockPaymentId: params.mockPaymentId,
    stripeCustomerId: params.stripeCustomerId ?? existing?.stripeCustomerId ?? null,
    stripeSubscriptionId: params.stripeSubscriptionId ?? existing?.stripeSubscriptionId ?? null,
  };
  if (existing) {
    await prisma.subscription.update({ where: { id: existing.id }, data });
  } else {
    await prisma.subscription.create({ data: { userId: params.userId, ...data } });
  }
}

export async function applyCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  if (!shouldActivateCheckout(session)) return;

  const userId = await resolveUserId({
    userId: session.metadata?.userId,
    clientReferenceId: session.client_reference_id,
    customerId: stripeObjectId(session.customer),
    email: session.customer_email ?? session.customer_details?.email,
  });
  if (!userId) {
    console.error("stripe checkout.session.completed: no matching user");
    return;
  }

  const plan: "MONTHLY" | "YEARLY" = session.metadata?.plan === "YEARLY" ? "YEARLY" : "MONTHLY";

  await upsertFromStripe({
    userId,
    plan,
    status: "ACTIVE",
    renewalDate: addCadence(new Date(), plan),
    canceledAt: null,
    stripeCustomerId: stripeObjectId(session.customer),
    stripeSubscriptionId: stripeObjectId(session.subscription),
    mockPaymentId: session.id,
  });
}

export async function applyStripeSubscription(
  sub: Stripe.Subscription,
  extra?: { mockPaymentId?: string }
): Promise<void> {
  const userId = await resolveUserId({
    userId: sub.metadata?.userId,
    customerId: stripeObjectId(sub.customer),
  });
  if (!userId) {
    console.error("stripe subscription event: no matching user");
    return;
  }
  const plan = planFromSubscription(sub);
  const mapped = mapStripeSubscriptionStatus(sub.status, Boolean(sub.cancel_at_period_end));
  await upsertFromStripe({
    userId,
    plan,
    status: mapped.status,
    renewalDate: periodEndFromSubscription(sub, plan),
    canceledAt: mapped.canceledAt,
    stripeCustomerId: stripeObjectId(sub.customer),
    stripeSubscriptionId: sub.id,
    mockPaymentId: extra?.mockPaymentId ?? sub.id,
  });
}
