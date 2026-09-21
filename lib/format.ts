import { startOfDay } from "./scores";

export function formatDate(date: Date): string {
  return startOfDay(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function isoDate(date: Date): string {
  const d = startOfDay(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "Active",
    CANCELED: "Canceling",
    LAPSED: "Lapsed",
    INACTIVE: "Inactive",
    DRAFT: "Draft",
    SIMULATED: "Simulated",
    PUBLISHED: "Published",
    PENDING: "Pending",
    PAID: "Paid",
    NONE: "Not submitted",
    SUBMITTED: "In review",
    APPROVED: "Verified",
    REJECTED: "Needs resubmit",
    USER: "Player",
    ADMIN: "Admin",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
    RANDOM: "Random lottery",
    ALGORITHMIC: "Score-weighted",
  };
  return map[status] ?? status;
}
