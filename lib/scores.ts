import { MAX_SCORES, SCORE_MAX, SCORE_MIN } from "./config";

export function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function parsePlayedOn(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    throw new Error("Use a date in YYYY-MM-DD format.");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("That date is not valid.");
  }
  const today = startOfDay(new Date());
  if (date.getTime() > today.getTime()) {
    throw new Error("Scores cannot be dated in the future.");
  }
  return date;
}

export function validateScoreValue(value: number): number {
  if (!Number.isInteger(value) || value < SCORE_MIN || value > SCORE_MAX) {
    throw new Error(`Stableford scores must be whole numbers from ${SCORE_MIN} to ${SCORE_MAX}.`);
  }
  return value;
}

export type StoredScore = {
  id: string;
  value: number;
  playedOn: Date;
};

/**
 * Rolling window of five. A sixth distinct date drops the oldest round.
 * Same-date duplicates are rejected — edit or delete the existing row.
 */
export function planScoreWrite(
  existing: StoredScore[],
  input: { id?: string; value: number; playedOn: Date }
): { keep: StoredScore[]; dropIds: string[] } {
  const value = validateScoreValue(input.value);
  const playedOn = startOfDay(input.playedOn);

  const collision = existing.find(
    (row) => row.playedOn.getTime() === playedOn.getTime() && row.id !== input.id
  );
  if (collision) {
    throw new Error("Only one score is allowed per date. Edit or delete the existing round.");
  }

  let next: StoredScore[];
  if (input.id) {
    const current = existing.find((row) => row.id === input.id);
    if (!current) {
      throw new Error("That score could not be found.");
    }
    next = existing.map((row) =>
      row.id === input.id ? { ...row, value, playedOn } : row
    );
  } else {
    next = [...existing, { id: "__new__", value, playedOn }];
  }

  next.sort((a, b) => b.playedOn.getTime() - a.playedOn.getTime());
  const dropIds = next.slice(MAX_SCORES).map((row) => row.id).filter((id) => id !== "__new__");
  const keep = next.slice(0, MAX_SCORES);
  return { keep, dropIds };
}
