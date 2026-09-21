import { prisma } from "./db";
import { ticketFromScores } from "./draw-engine";

export async function eligibleTickets() {
  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      subscription: { status: "ACTIVE" },
    },
    include: {
      scores: { orderBy: { playedOn: "desc" }, take: 5 },
    },
  });

  return users
    .filter((user) => user.scores.length === 5)
    .map((user) => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      numbers: ticketFromScores(user.scores.map((score) => score.value)),
    }))
    .filter((ticket) => ticket.numbers.length > 0);
}

export async function charityContributionThisMonth() {
  const subscribers = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { user: { include: { charityChoice: true } } },
  });

  const { monthlyEquivalentPence } = await import("./money");
  return subscribers.reduce((sum, sub) => {
    const percent = sub.user.charityChoice?.percent ?? 0;
    return sum + Math.round(monthlyEquivalentPence(sub.plan, sub.amountPence) * (percent / 100));
  }, 0);
}
