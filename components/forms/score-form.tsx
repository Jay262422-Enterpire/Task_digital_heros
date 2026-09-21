"use client";

import { useActionState } from "react";
import { upsertScoreAction, type ScoreState } from "@/lib/actions/scores";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function ScoreForm({
  userId,
  score,
}: {
  userId: string;
  score?: { id: string; value: number; playedOn: string };
}) {
  const [state, action] = useActionState(upsertScoreAction, {} as ScoreState);
  return (
    <form action={action} className="rounded-2xl border border-white/10 bg-card p-5">
      {score ? <input type="hidden" name="id" value={score.id} /> : null}
      <input type="hidden" name="userId" value={userId} />
      <FormAlert error={state.error} success={state.success} />
      <FieldGroup className="mt-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`value-${score?.id ?? "new"}`}>Stableford (1–45)</FieldLabel>
            <Input
              id={`value-${score?.id ?? "new"}`}
              name="value"
              type="number"
              min={1}
              max={45}
              defaultValue={score?.value}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`date-${score?.id ?? "new"}`}>Date played</FieldLabel>
            <Input
              id={`date-${score?.id ?? "new"}`}
              name="playedOn"
              type="date"
              defaultValue={score?.playedOn}
              required
            />
          </Field>
        </div>
      </FieldGroup>
      <div className="mt-4">
        <SubmitButton>{score ? "Save edit" : "Add score"}</SubmitButton>
      </div>
    </form>
  );
}
