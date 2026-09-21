export function formatPence(pence: number): string {
  const sign = pence < 0 ? "-" : "";
  const abs = Math.abs(pence);
  const pounds = Math.floor(abs / 100);
  const rest = abs % 100;
  return `${sign}£${pounds.toLocaleString("en-GB")}.${rest.toString().padStart(2, "0")}`;
}

export function monthlyEquivalentPence(plan: string, amountPence: number): number {
  return plan === "YEARLY" ? Math.round(amountPence / 12) : amountPence;
}

export function addCadence(from: Date, plan: string): Date {
  const next = new Date(from);
  if (plan === "YEARLY") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}
