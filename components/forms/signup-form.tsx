"use client";

import { useActionState } from "react";
import { signupAction, type ActionState } from "@/lib/actions/auth";
import { MIN_CHARITY_PERCENT } from "@/lib/config";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function SignupForm({
  charities,
  defaultCharityId,
}: {
  charities: { id: string; name: string }[];
  defaultCharityId?: string;
}) {
  const [state, action] = useActionState(signupAction, {} as ActionState);
  return (
    <form action={action} className="space-y-5">
      <FormAlert error={state.error} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" minLength={8} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="charityId">Charity recipient</FieldLabel>
          <select
            id="charityId"
            name="charityId"
            defaultValue={defaultCharityId ?? charities[0]?.id}
            className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
            required
          >
            {charities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="percent">Charity share (%)</FieldLabel>
          <Input
            id="percent"
            name="percent"
            type="number"
            min={MIN_CHARITY_PERCENT}
            max={90}
            defaultValue={10}
            required
          />
          <FieldDescription>Minimum 10% of your subscription fee.</FieldDescription>
        </Field>
      </FieldGroup>
      <SubmitButton className="w-full">Create account</SubmitButton>
    </form>
  );
}
