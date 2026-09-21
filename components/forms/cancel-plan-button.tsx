"use client";

import { cancelSubscriptionAction } from "@/lib/actions/subscription";
import { SubmitButton } from "@/components/submit-button";

export function CancelPlanButton() {
  return (
    <form
      action={async () => {
        await cancelSubscriptionAction();
      }}
    >
      <SubmitButton variant="ghost">Cancel at period end</SubmitButton>
    </form>
  );
}
