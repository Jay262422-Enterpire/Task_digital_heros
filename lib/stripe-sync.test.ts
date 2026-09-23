import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapStripeSubscriptionStatus,
  periodEndFromSubscription,
  planFromSubscription,
  shouldActivateCheckout,
} from "./stripe-map";
import { STRIPE_NOT_CONFIGURED, stripeConfigError, planFromPriceId } from "./stripe";
import { addCadence } from "./money";

describe("mapStripeSubscriptionStatus", () => {
  it("keeps active subscriptions active", () => {
    assert.deepEqual(mapStripeSubscriptionStatus("active", false), {
      status: "ACTIVE",
      canceledAt: null,
    });
  });

  it("keeps access when cancel_at_period_end is set", () => {
    const mapped = mapStripeSubscriptionStatus("active", true);
    assert.equal(mapped.status, "ACTIVE");
    assert.ok(mapped.canceledAt instanceof Date);
  });

  it("marks past_due as lapsed", () => {
    assert.equal(mapStripeSubscriptionStatus("past_due", false).status, "LAPSED");
  });

  it("marks canceled as canceled", () => {
    assert.equal(mapStripeSubscriptionStatus("canceled", false).status, "CANCELED");
  });
});

describe("shouldActivateCheckout", () => {
  it("activates only a completed paid subscription checkout", () => {
    assert.equal(
      shouldActivateCheckout({ mode: "subscription", status: "complete", payment_status: "paid" }),
      true
    );
  });

  it("does not activate cancelled or unpaid checkout", () => {
    assert.equal(
      shouldActivateCheckout({ mode: "subscription", status: "open", payment_status: "unpaid" }),
      false
    );
    assert.equal(
      shouldActivateCheckout({
        mode: "subscription",
        status: "complete",
        payment_status: "unpaid",
      }),
      false
    );
    assert.equal(shouldActivateCheckout({ mode: "payment", status: "complete" }), false);
  });
});

describe("periodEndFromSubscription", () => {
  it("reads current_period_end from the first item", () => {
    const end = Math.floor(Date.now() / 1000) + 86400;
    const date = periodEndFromSubscription(
      { items: { data: [{ current_period_end: end }] } } as never,
      "MONTHLY"
    );
    assert.equal(date.toISOString(), new Date(end * 1000).toISOString());
  });

  it("falls back to cadence when Stripe omits the timestamp", () => {
    const before = Date.now();
    const date = periodEndFromSubscription({ items: { data: [] } } as never, "MONTHLY");
    const expected = addCadence(new Date(before), "MONTHLY").getTime();
    assert.ok(Math.abs(date.getTime() - expected) < 5_000);
  });
});

describe("planFromSubscription", () => {
  it("uses metadata when the price is unknown", () => {
    assert.equal(
      planFromSubscription({ items: { data: [] }, metadata: { plan: "YEARLY" } } as never),
      "YEARLY"
    );
  });
});

describe("stripeConfigError", () => {
  it("refuses to fake payment when keys are missing", () => {
    const prev = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_PRICE_MONTHLY: process.env.STRIPE_PRICE_MONTHLY,
      STRIPE_PRICE_YEARLY: process.env.STRIPE_PRICE_YEARLY,
    };
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRICE_MONTHLY;
    delete process.env.STRIPE_PRICE_YEARLY;
    try {
      assert.equal(stripeConfigError(), STRIPE_NOT_CONFIGURED);
      assert.equal(planFromPriceId("price_x"), null);
    } finally {
      if (prev.STRIPE_SECRET_KEY) process.env.STRIPE_SECRET_KEY = prev.STRIPE_SECRET_KEY;
      else delete process.env.STRIPE_SECRET_KEY;
      if (prev.STRIPE_PRICE_MONTHLY) process.env.STRIPE_PRICE_MONTHLY = prev.STRIPE_PRICE_MONTHLY;
      else delete process.env.STRIPE_PRICE_MONTHLY;
      if (prev.STRIPE_PRICE_YEARLY) process.env.STRIPE_PRICE_YEARLY = prev.STRIPE_PRICE_YEARLY;
      else delete process.env.STRIPE_PRICE_YEARLY;
    }
  });
});
