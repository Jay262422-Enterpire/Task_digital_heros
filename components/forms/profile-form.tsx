"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "@/lib/actions/auth";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function ProfileForm({ name }: { name: string }) {
  const [state, action] = useActionState(updateProfileAction, {} as ActionState);
  return (
    <form action={action} className="space-y-3 rounded-2xl border border-white/10 bg-card p-5">
      <h2 className="font-heading text-xl">Profile</h2>
      <FormAlert error={state.error} success={state.success} />
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" name="name" defaultValue={name} required />
      </Field>
      <SubmitButton>Save name</SubmitButton>
    </form>
  );
}
