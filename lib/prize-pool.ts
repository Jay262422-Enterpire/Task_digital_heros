import { PRIZE_POOL_RATE } from "./config";
import { prisma } from "./db";
import { monthlyEquivalentPence } from "./money";

export async function unclaimedJackpotCarryPence(): Promise<number> {
  const lastPublished = await prisma.draw.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { wins: true },
  });
  if (!lastPublished) return 0;
  const hitJackpot = lastPublished.wins.some((win) => win.matchCount === 5);
  if (hitJackpot) return 0;
  return Math.round(lastPublished.prizePoolPence * 0.4);
}

export async function activePrizePoolPence(): Promise<{
  subscriberCount: number;
  monthlyRevenuePence: number;
  poolPence: number;
  carryPence: number;
  totalPence: number;
}> {
  const subscribers = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
  });
  const monthlyRevenuePence = subscribers.reduce(
    (sum, sub) => sum + monthlyEquivalentPence(sub.plan, sub.amountPence),
    0
  );
  const poolPence = Math.round(monthlyRevenuePence * PRIZE_POOL_RATE);
  const carryPence = await unclaimedJackpotCarryPence();
  return {
    subscriberCount: subscribers.length,
    monthlyRevenuePence,
    poolPence,
    carryPence,
    totalPence: poolPence + carryPence,
  };
}

export function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
