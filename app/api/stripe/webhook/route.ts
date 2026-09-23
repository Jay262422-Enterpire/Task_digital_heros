import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { applyCheckoutSession, applyStripeSubscription } from "@/lib/stripe-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "id" in value && typeof (value as { id: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return null;
}

async function handleEvent(event: Stripe.Event) {
  const stripe = getStripe();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await applyCheckoutSession(session);
      const subscriptionId = asId(session.subscription);
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await applyStripeSubscription(sub, { mockPaymentId: session.id });
      }
      return;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const fresh = await stripe.subscriptions.retrieve(sub.id);
      await applyStripeSubscription(fresh);
      return;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await applyStripeSubscription({ ...sub, status: "canceled", cancel_at_period_end: false });
      return;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        asId((invoice as { subscription?: unknown }).subscription) ??
        asId(
          (invoice as { parent?: { subscription_details?: { subscription?: unknown } } }).parent
            ?.subscription_details?.subscription
        );
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await applyStripeSubscription(sub, { mockPaymentId: invoice.id });
      }
      return;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        asId((invoice as { subscription?: unknown }).subscription) ??
        asId(
          (invoice as { parent?: { subscription_details?: { subscription?: unknown } } }).parent
            ?.subscription_details?.subscription
        );
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await applyStripeSubscription(sub);
      }
      return;
    }
    default:
      return;
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret?.startsWith("whsec_")) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) {
    return Response.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (error) {
    console.error("stripe webhook handler failed", error);
    return Response.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return Response.json({ received: true });
}
