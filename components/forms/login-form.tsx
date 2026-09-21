"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "@/lib/actions/auth";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, {} as ActionState);
  return (
    <form action={action} className="space-y-5">
      <FormAlert error={state.error} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </Field>
      </FieldGroup>
      <SubmitButton className="w-full">Sign in</SubmitButton>
      <p className="text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
