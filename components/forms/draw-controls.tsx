"use client";

import { useActionState } from "react";
import {
  configureDrawAction,
  simulateDrawAction,
  publishDrawAction,
  type DrawState,
} from "@/lib/actions/draws";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function DrawControls({
  year,
  month,
  type,
  status,
}: {
  year: number;
  month: number;
  type: string;
  status: string;
}) {
  const [state, action] = useActionState(configureDrawAction, {} as DrawState);
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="month" value={month} />
        <FormAlert error={state.error} success={state.success} />
        <FieldGroup>
          <Field>
            <FieldLabel>Engine</FieldLabel>
            <select
              name="type"
              defaultValue={type}
              disabled={status === "PUBLISHED"}
              className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
            >
              <option value="RANDOM">Random lottery</option>
              <option value="ALGORITHMIC">Score-weighted algorithm</option>
            </select>
          </Field>
        </FieldGroup>
        {status !== "PUBLISHED" ? <SubmitButton>Save engine & refresh pool</SubmitButton> : null}
      </form>
      {status !== "PUBLISHED" ? (
        <div className="flex flex-wrap gap-2">
          <form
            action={async () => {
              await simulateDrawAction(year, month);
            }}
          >
            <SubmitButton variant="secondary">Simulate</SubmitButton>
          </form>
          <form
            action={async () => {
              await publishDrawAction(year, month);
            }}
          >
            <SubmitButton>Publish results</SubmitButton>
          </form>
        </div>
      ) : null}
    </div>
  );
}
