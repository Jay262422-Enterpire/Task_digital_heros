"use client";

import { useActionState } from "react";
import { subscribeAction, type SubState } from "@/lib/actions/subscription";
import { formatPence } from "@/lib/money";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function SubscribeForm({
  plans,
}: {
  plans: { id: string; label: string; amountPence: number; note: string }[];
}) {
  const [state, action] = useActionState(subscribeAction, {} as SubState);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <FormAlert error={state.error} className="md:col-span-2" />
      {plans.map((plan, index) => (
        <label
          key={plan.id}
          className="flex cursor-pointer flex-col rounded-2xl border border-white/10 bg-card p-6 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/40"
        >
          <input
            type="radio"
            name="plan"
            value={plan.id}
            defaultChecked={index === 0}
            className="sr-only"
          />
          <span className="text-xs uppercase tracking-wider text-primary">{plan.label}</span>
          <span className="mt-2 font-heading text-4xl">{formatPence(plan.amountPence)}</span>
          <span className="mt-2 text-sm text-muted-foreground">{plan.note}</span>
        </label>
      ))}
      <div className="md:col-span-2">
        <SubmitButton className="h-11 w-full rounded-full sm:w-auto sm:px-8">
          Pay with mock Stripe
        </SubmitButton>
        <p className="mt-3 text-xs text-muted-foreground">
          No card is charged. This environment uses a PCI-shaped mock: a successful “payment”
          activates the subscription immediately. Swap in Stripe keys later without changing the
          rest of the flow.
        </p>
      </div>
    </form>
  );
}
