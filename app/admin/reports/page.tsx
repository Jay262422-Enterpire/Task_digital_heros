import { prisma } from "@/lib/db";
import { formatPence, monthlyEquivalentPence } from "@/lib/money";
import { activePrizePoolPence, monthLabel } from "@/lib/prize-pool";
import { charityContributionThisMonth } from "@/lib/queries";

export default async function AdminReportsPage() {
  const [users, pool, charityMonth, donations, draws, choices] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" },
      include: { subscription: true },
    }),
    activePrizePoolPence(),
    charityContributionThisMonth(),
    prisma.donation.findMany({ include: { charity: true } }),
    prisma.draw.findMany({ include: { wins: true }, orderBy: [{ year: "desc" }, { month: "desc" }] }),
    prisma.charityChoice.findMany({ include: { charity: true, user: { include: { subscription: true } } } }),
  ]);

  const byStatus = users.reduce<Record<string, number>>((acc, user) => {
    const status = user.subscription?.status ?? "INACTIVE";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  const charityTotals = new Map<string, { name: string; subscriptionPence: number; giftsPence: number }>();
  for (const choice of choices) {
    const sub = choice.user.subscription;
    if (!sub || sub.status !== "ACTIVE") continue;
    const amount = Math.round(
      monthlyEquivalentPence(sub.plan, sub.amountPence) * (choice.percent / 100)
    );
    const current = charityTotals.get(choice.charityId) ?? {
      name: choice.charity.name,
      subscriptionPence: 0,
      giftsPence: 0,
    };
    current.subscriptionPence += amount;
    charityTotals.set(choice.charityId, current);
  }
  for (const donation of donations) {
    const current = charityTotals.get(donation.charityId) ?? {
      name: donation.charity.name,
      subscriptionPence: 0,
      giftsPence: 0,
    };
    current.giftsPence += donation.amountPence;
    charityTotals.set(donation.charityId, current);
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total players" value={String(users.length)} />
        <Stat label="Prize pool" value={formatPence(pool.totalPence)} />
        <Stat label="Charity (subs, this month)" value={formatPence(charityMonth)} />
      </section>

      <section>
        <h2 className="font-heading text-2xl">Subscription mix</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-4">
          {Object.entries(byStatus).map(([status, count]) => (
            <li key={status} className="rounded-xl border border-white/10 p-4 text-sm">
              {status}: {count}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-2xl">Charity totals</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/4 text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Charity</th>
                <th className="px-4 py-3">From subscriptions / mo</th>
                <th className="px-4 py-3">Independent gifts</th>
              </tr>
            </thead>
            <tbody>
              {[...charityTotals.values()].map((row) => (
                <tr key={row.name} className="border-t border-white/8">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{formatPence(row.subscriptionPence)}</td>
                  <td className="px-4 py-3">{formatPence(row.giftsPence)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-2xl">Draw statistics</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {draws.map((draw) => (
            <li key={draw.id} className="rounded-xl border border-white/10 px-4 py-3">
              {monthLabel(draw.year, draw.month)} · {draw.status} · pool {formatPence(draw.prizePoolPence)} ·{" "}
              {draw.wins.length} winner{draw.wins.length === 1 ? "" : "s"} · 5-match{" "}
              {draw.wins.filter((w) => w.matchCount === 5).length}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-3xl">{value}</p>
    </div>
  );
}
