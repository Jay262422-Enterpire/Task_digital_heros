import Stripe from "stripe";
import { PLANS } from "@/lib/config";

export const STRIPE_NOT_CONFIGURED =
  "Stripe is not configured. Set STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, and STRIPE_PRICE_YEARLY. No payment was taken and no plan was activated.";

export function stripeConfigError(): string | null {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) {
    return STRIPE_NOT_CONFIGURED;
  }
  if (!process.env.STRIPE_PRICE_MONTHLY?.startsWith("price_")) {
    return STRIPE_NOT_CONFIGURED;
  }
  if (!process.env.STRIPE_PRICE_YEARLY?.startsWith("price_")) {
    return STRIPE_NOT_CONFIGURED;
  }
  return null;
}

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) {
    throw new Error(STRIPE_NOT_CONFIGURED);
  }
  cached ??= new Stripe(key);
  return cached;
}

export function priceIdForPlan(plan: "MONTHLY" | "YEARLY"): string | null {
  const id =
    plan === "YEARLY" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
  return id?.startsWith("price_") ? id : null;
}

export function planFromPriceId(priceId: string | null | undefined): "MONTHLY" | "YEARLY" | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_YEARLY) return "YEARLY";
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "MONTHLY";
  return null;
}

export function planAmountPence(plan: "MONTHLY" | "YEARLY"): number {
  return PLANS[plan].amountPence;
}
