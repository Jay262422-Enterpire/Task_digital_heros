import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isoDate } from "@/lib/format";
import { AdminUserForms } from "@/components/forms/admin-user-forms";
import { ScoreForm } from "@/components/forms/score-form";
import { deleteScoreAction } from "@/lib/actions/scores";
import { SubmitButton } from "@/components/submit-button";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: true,
      scores: { orderBy: { playedOn: "desc" } },
    },
  });
  if (!user) notFound();

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-heading text-2xl">{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <AdminUserForms
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription
            ? { plan: user.subscription.plan, status: user.subscription.status }
            : null,
        }}
      />
      <div>
        <h3 className="mb-3 font-heading text-xl">Golf scores</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {user.scores.map((score) => (
            <div key={score.id} className="space-y-2">
              <form
                action={async () => {
                  "use server";
                  await deleteScoreAction(score.id, user.id);
                }}
              >
                <SubmitButton variant="ghost">Delete this round</SubmitButton>
              </form>
              <ScoreForm
                userId={user.id}
                score={{ id: score.id, value: score.value, playedOn: isoDate(score.playedOn) }}
              />
            </div>
          ))}
          <ScoreForm userId={user.id} />
        </div>
      </div>
    </div>
  );
}
