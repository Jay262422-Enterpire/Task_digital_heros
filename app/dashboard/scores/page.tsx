import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, isoDate } from "@/lib/format";
import { refreshSubscriptionStatus, isSubscriber } from "@/lib/subscriptions";
import { deleteScoreAction } from "@/lib/actions/scores";
import { ScoreForm } from "@/components/forms/score-form";
import { SubscriberGate } from "@/components/subscriber-gate";
import { SubmitButton } from "@/components/submit-button";

export default async function ScoresPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const sub = await refreshSubscriptionStatus(session.id);
  const scores = await prisma.score.findMany({
    where: { userId: session.id },
    orderBy: { playedOn: "desc" },
  });

  return (
    <SubscriberGate active={isSubscriber(sub?.status)}>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <h2 className="font-heading text-2xl">Rolling five</h2>
          <p className="text-sm text-muted-foreground">
            Most recent first. A sixth distinct date drops the oldest round. Same-date duplicates
            are blocked — edit or delete instead.
          </p>
          {scores.length === 0 ? (
            <p className="text-muted-foreground">No scores yet. Add your last round.</p>
          ) : (
            <ul className="space-y-4">
              {scores.map((score) => (
                <li key={score.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatDate(score.playedOn)}</span>
                    <form
                      action={async () => {
                        "use server";
                        await deleteScoreAction(score.id, session.id);
                      }}
                    >
                      <SubmitButton variant="ghost">Delete</SubmitButton>
                    </form>
                  </div>
                  <ScoreForm
                    userId={session.id}
                    score={{ id: score.id, value: score.value, playedOn: isoDate(score.playedOn) }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="mb-3 font-heading text-2xl">Add a round</h2>
          <ScoreForm userId={session.id} />
        </div>
      </div>
    </SubscriberGate>
  );
}
