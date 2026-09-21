"use client";

import { useActionState } from "react";
import { adminUpdateUserAction, adminResetPasswordAction, type AdminState } from "@/lib/actions/admin";
import { adminSetSubscriptionAction, type SubState } from "@/lib/actions/subscription";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function AdminUserForms({
  user,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    subscription: { plan: string; status: string } | null;
  };
}) {
  const [profileState, profileAction] = useActionState(adminUpdateUserAction, {} as AdminState);
  const [subState, subAction] = useActionState(adminSetSubscriptionAction, {} as SubState);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={profileAction} className="space-y-4 rounded-2xl border border-white/10 bg-card p-5">
        <h3 className="font-heading text-xl">Profile</h3>
        <input type="hidden" name="userId" value={user.id} />
        <FormAlert error={profileState.error} success={profileState.success} />
        <FieldGroup>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input name="name" defaultValue={user.name} />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input name="email" defaultValue={user.email} />
          </Field>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <select
              name="role"
              defaultValue={user.role}
              className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
            >
              <option value="USER">Player</option>
              <option value="ADMIN">Admin</option>
            </select>
          </Field>
        </FieldGroup>
        <SubmitButton>Save profile</SubmitButton>
      </form>
      <form action={subAction} className="space-y-4 rounded-2xl border border-white/10 bg-card p-5">
        <h3 className="font-heading text-xl">Subscription</h3>
        <input type="hidden" name="userId" value={user.id} />
        <FormAlert error={subState.error} success={subState.success} />
        <FieldGroup>
          <Field>
            <FieldLabel>Plan</FieldLabel>
            <select
              name="plan"
              defaultValue={user.subscription?.plan ?? "MONTHLY"}
              className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </Field>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <select
              name="status"
              defaultValue={user.subscription?.status ?? "INACTIVE"}
              className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
            >
              <option value="ACTIVE">Active</option>
              <option value="CANCELED">Canceled</option>
              <option value="LAPSED">Lapsed</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>
        </FieldGroup>
        <SubmitButton>Update subscription</SubmitButton>
      </form>
      <form
        action={async () => {
          await adminResetPasswordAction(user.id);
        }}
        className="lg:col-span-2"
      >
        <SubmitButton variant="outline">Reset password to HeroPlay!26</SubmitButton>
      </form>
    </div>
  );
}
