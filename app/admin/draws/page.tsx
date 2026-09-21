import { prisma } from "@/lib/db";
import { formatPence } from "@/lib/money";
import { activePrizePoolPence, monthLabel } from "@/lib/prize-pool";
import { eligibleTickets } from "@/lib/queries";
import { matchCount, splitPrizePool } from "@/lib/draw-engine";
import { NumberRow } from "@/components/number-balls";
import { DrawControls } from "@/components/forms/draw-controls";
import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/format";

export default async function AdminDrawsPage() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  let current = await prisma.draw.findUnique({ where: { year_month: { year, month } } });
  if (!current) {
    const pool = await activePrizePoolPence();
    current = await prisma.draw.create({
      data: {
        year,
        month,
        type: "RANDOM",
        status: "DRAFT",
        prizePoolPence: pool.totalPence,
        jackpotCarryPence: pool.carryPence,
      },
    });
  } else if (current.status !== "PUBLISHED") {
    const pool = await activePrizePoolPence();
    current = await prisma.draw.update({
      where: { id: current.id },
      data: {
        prizePoolPence: pool.totalPence,
        jackpotCarryPence: pool.carryPence,
      },
    });
  }

  const tickets = await eligibleTickets();
  const numbers = JSON.parse(current.numbersJson) as number[];
  const preview =
    numbers.length === 5
      ? tickets
          .map((t) => ({
            ...t,
            matchCount: matchCount(t.numbers, numbers),
          }))
          .filter((t) => t.matchCount >= 3)
      : [];
  const split = numbers.length === 5 ? splitPrizePool(current.prizePoolPence, preview) : null;
  const history = await prisma.draw.findMany({
    where: { NOT: { id: current.id } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { _count: { select: { wins: true } } },
  });

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/10 bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary">Open window</p>
            <h2 className="font-heading text-3xl">{monthLabel(current.year, current.month)}</h2>
          </div>
          <Badge>{statusLabel(current.status)}</Badge>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Pool {formatPence(current.prizePoolPence)} including {formatPence(current.jackpotCarryPence)}{" "}
          jackpot carry. {tickets.length} eligible tickets (active plan + five scores).
        </p>
        <div className="mt-6">
          <DrawControls
            year={current.year}
            month={current.month}
            type={current.type}
            status={current.status}
          />
        </div>
        {numbers.length === 5 ? (
          <div className="mt-6">
            <p className="mb-2 text-sm text-muted-foreground">Simulated / published numbers</p>
            <NumberRow numbers={numbers} />
            {split ? (
              <ul className="mt-4 space-y-2 text-sm">
                {preview.length === 0 ? (
                  <li>No 3+ matches in this simulation. Jackpot would roll.</li>
                ) : (
                  preview.map((row) => (
                    <li key={row.userId}>
                      {row.name} · {row.matchCount} match ·{" "}
                      {formatPence(
                        split.awards.find((a) => a.userId === row.userId)?.amountPence ?? 0
                      )}
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Run a simulation to preview winners before publishing.</p>
        )}
      </section>

      <section>
        <h3 className="font-heading text-xl">History</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {history.map((draw) => (
            <li key={draw.id} className="rounded-xl border border-white/10 px-4 py-3">
              {monthLabel(draw.year, draw.month)} · {statusLabel(draw.status)} · {statusLabel(draw.type)} ·{" "}
              {draw._count.wins} winner{draw._count.wins === 1 ? "" : "s"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
