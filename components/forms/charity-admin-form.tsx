"use client";

import { useActionState } from "react";
import {
  adminSaveCharityAction,
  adminDeleteCharityAction,
  adminSaveEventAction,
  type CharityState,
} from "@/lib/actions/charity";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function CharityAdminForm({
  charity,
}: {
  charity?: {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    description: string;
    cause: string;
    accent: string;
    featured: boolean;
  };
}) {
  const [state, action] = useActionState(adminSaveCharityAction, {} as CharityState);
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-white/10 bg-card p-5">
      {charity ? <input type="hidden" name="id" value={charity.id} /> : null}
      <FormAlert error={state.error} success={state.success} />
      <FieldGroup>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input name="name" defaultValue={charity?.name} required />
        </Field>
        <Field>
          <FieldLabel>Slug</FieldLabel>
          <Input name="slug" defaultValue={charity?.slug} required />
        </Field>
        <Field>
          <FieldLabel>Tagline</FieldLabel>
          <Input name="tagline" defaultValue={charity?.tagline} required />
        </Field>
        <Field>
          <FieldLabel>Description</FieldLabel>
          <Textarea name="description" defaultValue={charity?.description} required />
        </Field>
        <Field>
          <FieldLabel>Cause</FieldLabel>
          <select
            name="cause"
            defaultValue={charity?.cause ?? "community"}
            className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
          >
            <option value="junior">Young players</option>
            <option value="environment">Land & climate</option>
            <option value="health">Care</option>
            <option value="veterans">Service leavers</option>
            <option value="community">Neighbourhood</option>
          </select>
        </Field>
        <Field>
          <FieldLabel>Accent colour</FieldLabel>
          <Input name="accent" defaultValue={charity?.accent ?? "#e8b86d"} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={charity?.featured} />
          Featured on homepage
        </label>
      </FieldGroup>
      <div className="flex gap-2">
        <SubmitButton>{charity ? "Save" : "Add charity"}</SubmitButton>
      </div>
    </form>
  );
}

export function DeleteCharityButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        await adminDeleteCharityAction(id);
      }}
    >
      <SubmitButton variant="destructive">Delete</SubmitButton>
    </form>
  );
}

export function EventForm({ charityId }: { charityId: string }) {
  const [state, action] = useActionState(adminSaveEventAction, {} as CharityState);
  return (
    <form action={action} className="mt-3 space-y-3">
      <input type="hidden" name="charityId" value={charityId} />
      <FormAlert error={state.error} success={state.success} />
      <Input name="title" placeholder="Event title" required />
      <Input name="happensOn" type="date" required />
      <Input name="location" placeholder="Location" required />
      <Textarea name="description" placeholder="What happens" required />
      <SubmitButton variant="secondary">Add event</SubmitButton>
    </form>
  );
}
