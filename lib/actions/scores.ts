"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parsePlayedOn, planScoreWrite, startOfDay } from "@/lib/scores";
import { refreshSubscriptionStatus, isSubscriber } from "@/lib/subscriptions";

export type ScoreState = { error?: string; success?: string };

async function assertCanEditScores(userId: string, actorId: string, actorRole: string) {
  if (actorRole === "ADMIN") return;
  if (actorId !== userId) {
    throw new Error("You can only edit your own scores.");
  }
  const sub = await refreshSubscriptionStatus(userId);
  if (!isSubscriber(sub?.status)) {
    throw new Error("An active subscription is required to enter scores.");
  }
}

export async function upsertScoreAction(
  _prev: ScoreState,
  formData: FormData
): Promise<ScoreState> {
  const session = await getSession();
  if (!session) return { error: "Sign in to continue." };

  const userId = String(formData.get("userId") || session.id);
  try {
    await assertCanEditScores(userId, session.id, session.role);
    const value = Number(formData.get("value"));
    const playedOn = parsePlayedOn(String(formData.get("playedOn") ?? ""));
    const id = String(formData.get("id") || "");

    const existing = await prisma.score.findMany({ where: { userId } });
    const plan = planScoreWrite(
      existing.map((row) => ({ id: row.id, value: row.value, playedOn: startOfDay(row.playedOn) })),
      { id: id || undefined, value, playedOn }
    );

    await prisma.$transaction(async (tx) => {
      if (plan.dropIds.length) {
        await tx.score.deleteMany({ where: { id: { in: plan.dropIds } } });
      }
      if (id) {
        await tx.score.update({
          where: { id },
          data: { value, playedOn },
        });
      } else {
        await tx.score.create({
          data: { userId, value, playedOn },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/scores");
    revalidatePath("/admin/users");
    return { success: id ? "Score updated." : "Score saved. Oldest rounds drop after five." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save that score." };
  }
}

export async function deleteScoreAction(scoreId: string, userId: string): Promise<ScoreState> {
  const session = await getSession();
  if (!session) return { error: "Sign in to continue." };
  try {
    await assertCanEditScores(userId, session.id, session.role);
    await prisma.score.delete({ where: { id: scoreId } });
    revalidatePath("/dashboard/scores");
    revalidatePath("/dashboard");
    revalidatePath("/admin/users");
    return { success: "Score removed." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete that score." };
  }
}
