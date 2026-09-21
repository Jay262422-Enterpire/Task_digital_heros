"use client";

import { useActionState } from "react";
import { uploadProofAction, type WinState } from "@/lib/actions/wins";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function ProofForm({ winId }: { winId: string }) {
  const [state, action] = useActionState(uploadProofAction, {} as WinState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="winId" value={winId} />
      <FormAlert error={state.error} success={state.success} />
      <Field>
        <FieldLabel htmlFor={`proof-${winId}`}>Score screenshot</FieldLabel>
        <Input id={`proof-${winId}`} name="proof" type="file" accept="image/png,image/jpeg,image/webp" required />
      </Field>
      <SubmitButton>Submit proof</SubmitButton>
    </form>
  );
}
