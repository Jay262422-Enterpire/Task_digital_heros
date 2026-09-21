"use client";

import { useActionState } from "react";
import { donateAction, type CharityState } from "@/lib/actions/charity";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function DonateForm({
  charities,
  defaultCharityId,
  email,
}: {
  charities: { id: string; name: string }[];
  defaultCharityId?: string;
  email?: string;
}) {
  const [state, action] = useActionState(donateAction, {} as CharityState);
  return (
    <form action={action} className="space-y-5">
      <FormAlert error={state.error} success={state.success} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="charityId">Charity</FieldLabel>
          <select
            id="charityId"
            name="charityId"
            defaultValue={defaultCharityId ?? charities[0]?.id}
            className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
          >
            {charities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" defaultValue={email} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="amount">Amount (£)</FieldLabel>
          <Input id="amount" name="amount" type="number" min={1} step="1" defaultValue={10} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="message">Note (optional)</FieldLabel>
          <Textarea id="message" name="message" rows={3} />
        </Field>
      </FieldGroup>
      <SubmitButton>Send gift</SubmitButton>
    </form>
  );
}
