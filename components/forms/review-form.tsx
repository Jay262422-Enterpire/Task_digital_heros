"use client";

import { useActionState } from "react";
import { reviewProofAction, markPaidAction, type WinState } from "@/lib/actions/wins";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function ReviewForm({ winId }: { winId: string }) {
  const [state, action] = useActionState(reviewProofAction, {} as WinState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="winId" value={winId} />
      <FormAlert error={state.error} success={state.success} />
      <Field>
        <FieldLabel>Note</FieldLabel>
        <Textarea name="note" rows={2} />
      </Field>
      <div className="flex gap-2">
        <button
          type="submit"
          name="decision"
          value="APPROVED"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="REJECTED"
          className="inline-flex h-8 items-center rounded-lg bg-destructive/20 px-3 text-sm text-destructive"
        >
          Reject
        </button>
      </div>
    </form>
  );
}

export function MarkPaidButton({ winId }: { winId: string }) {
  return (
    <form
      action={async () => {
        await markPaidAction(winId);
      }}
    >
      <SubmitButton>Mark paid</SubmitButton>
    </form>
  );
}
