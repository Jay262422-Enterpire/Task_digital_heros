"use client";

import { useActionState } from "react";
import { saveCharityChoiceAction, type CharityState } from "@/lib/actions/charity";
import { MIN_CHARITY_PERCENT } from "@/lib/config";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function CharityChoiceForm({
  charities,
  charityId,
  percent,
}: {
  charities: { id: string; name: string }[];
  charityId?: string;
  percent: number;
}) {
  const [state, action] = useActionState(saveCharityChoiceAction, {} as CharityState);
  return (
    <form action={action} className="space-y-5">
      <FormAlert error={state.error} success={state.success} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="charityId">Recipient</FieldLabel>
          <select
            id="charityId"
            name="charityId"
            defaultValue={charityId}
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
          <FieldLabel htmlFor="percent">Share of subscription (%)</FieldLabel>
          <Input
            id="percent"
            name="percent"
            type="number"
            min={MIN_CHARITY_PERCENT}
            max={90}
            defaultValue={percent}
            required
          />
        </Field>
      </FieldGroup>
      <SubmitButton>Update charity</SubmitButton>
    </form>
  );
}
