import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { monthLabel } from "@/lib/prize-pool";
import { statusLabel } from "@/lib/format";
import { refreshSubscriptionStatus, isSubscriber } from "@/lib/subscriptions";
import { NumberRow } from "@/components/number-balls";
import { SubscriberGate } from "@/components/subscriber-gate";
import { Badge } from "@/components/ui/badge";
import { ticketFromScores } from "@/lib/draw-engine";

export default async function DrawsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const sub = await refreshSubscriptionStatus(session.id);
  const [draws, scores] = await Promise.all([
    prisma.draw.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { wins: { where: { userId: session.id } } },
    }),
    prisma.score.findMany({ where: { userId: session.id }, orderBy: { playedOn: "desc" }, take: 5 }),
  ]);
  const ticket = ticketFromScores(scores.map((s) => s.value));

  return (
    <SubscriberGate active={isSubscriber(sub?.status)}>
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl">Your ticket</h2>
          {scores.length < 5 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Store five scores to enter. You currently have {scores.length}.
            </p>
          ) : (
            <div className="mt-3">
              <NumberRow numbers={ticket} />
            </div>
          )}
        </div>
        <ul className="space-y-3">
          {draws.length === 0 ? (
            <p className="text-muted-foreground">No draws have been opened yet.</p>
          ) : (
            draws.map((draw) => (
              <li key={draw.id} className="rounded-2xl border border-white/10 bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-heading text-xl">{monthLabel(draw.year, draw.month)}</p>
                  <Badge variant={draw.status === "PUBLISHED" ? "default" : "secondary"}>
                    {statusLabel(draw.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{statusLabel(draw.type)}</p>
                {draw.status === "PUBLISHED" ? (
                  <div className="mt-3">
                    <NumberRow numbers={JSON.parse(draw.numbersJson) as number[]} size="sm" />
                    <p className="mt-2 text-sm">
                      {draw.wins[0]
                        ? `You matched ${draw.wins[0].matchCount}.`
                        : "No prize this month."}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Numbers stay hidden until an administrator publishes.
                  </p>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </SubscriberGate>
  );
}
