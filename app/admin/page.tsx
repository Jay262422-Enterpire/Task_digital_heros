import { prisma } from "@/lib/db";
import { formatPence } from "@/lib/money";
import { activePrizePoolPence } from "@/lib/prize-pool";
import { charityContributionThisMonth } from "@/lib/queries";

export default async function AdminHomePage() {
  const [users, subs, pool, charityPence, pendingProofs, draws] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    activePrizePoolPence(),
    charityContributionThisMonth(),
    prisma.win.count({ where: { proofStatus: "SUBMITTED" } }),
    prisma.draw.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }], take: 3 }),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Players", value: String(users) },
        { label: "Active plans", value: String(subs) },
        { label: "Live prize pool", value: formatPence(pool.totalPence) },
        { label: "Charity this month", value: formatPence(charityPence) },
        { label: "Proofs in review", value: String(pendingProofs) },
        { label: "Jackpot carry-in", value: formatPence(pool.carryPence) },
      ].map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</p>
          <p className="mt-2 font-heading text-3xl">{item.value}</p>
        </div>
      ))}
      <div className="rounded-2xl border border-white/10 bg-card p-5 sm:col-span-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent draws</p>
        <ul className="mt-3 space-y-2 text-sm">
          {draws.map((d) => (
            <li key={d.id}>
              {d.month}/{d.year} · {d.status.toLowerCase()} · {d.type.toLowerCase()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
