import type Stripe from "stripe";
import { addCadence } from "@/lib/money";
import { planFromPriceId } from "@/lib/stripe";

export type MappedSubStatus = "ACTIVE" | "CANCELED" | "LAPSED" | "INACTIVE";

export function mapStripeSubscriptionStatus(
  stripeStatus: string,
  cancelAtPeriodEnd: boolean
): { status: MappedSubStatus; canceledAt: Date | null } {
  if (cancelAtPeriodEnd && (stripeStatus === "active" || stripeStatus === "trialing")) {
    return { status: "ACTIVE", canceledAt: new Date() };
  }
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return { status: "ACTIVE", canceledAt: null };
    case "past_due":
    case "unpaid":
      return { status: "LAPSED", canceledAt: null };
    case "canceled":
    case "incomplete_expired":
      return { status: "CANCELED", canceledAt: new Date() };
    default:
      return { status: "INACTIVE", canceledAt: null };
  }
}

export function periodEndFromSubscription(sub: Stripe.Subscription, plan: "MONTHLY" | "YEARLY"): Date {
  const item = sub.items?.data?.[0] as { current_period_end?: number } | undefined;
  const ts =
    (sub as { current_period_end?: number }).current_period_end ?? item?.current_period_end;
  if (typeof ts === "number" && ts > 0) return new Date(ts * 1000);
  return addCadence(new Date(), plan);
}

export function priceIdFromSubscription(sub: Stripe.Subscription): string | null {
  const price = sub.items?.data?.[0]?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

export function planFromSubscription(
  sub: Stripe.Subscription,
  fallback?: string | null
): "MONTHLY" | "YEARLY" {
  const fromPrice = planFromPriceId(priceIdFromSubscription(sub));
  if (fromPrice) return fromPrice;
  if (fallback === "YEARLY" || sub.metadata?.plan === "YEARLY") return "YEARLY";
  return "MONTHLY";
}

export function stripeObjectId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function shouldActivateCheckout(session: {
  mode?: string | null;
  status?: string | null;
  payment_status?: string | null;
}): boolean {
  if (session.mode !== "subscription") return false;
  if (session.status && session.status !== "complete") return false;
  if (session.payment_status === "unpaid") return false;
  return true;
}
