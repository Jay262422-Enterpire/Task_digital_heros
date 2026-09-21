"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";
import { runDraw, splitPrizePool } from "@/lib/draw-engine";
import { activePrizePoolPence, monthLabel } from "@/lib/prize-pool";
import { eligibleTickets } from "@/lib/queries";

export type DrawState = { error?: string; success?: string };

async function loadOrCreateDraw(year: number, month: number) {
  const existing = await prisma.draw.findUnique({
    where: { year_month: { year, month } },
  });
  if (existing) return existing;
  const pool = await activePrizePoolPence();
  return prisma.draw.create({
    data: {
      year,
      month,
      type: "RANDOM",
      status: "DRAFT",
      prizePoolPence: pool.totalPence,
      jackpotCarryPence: pool.carryPence,
    },
  });
}

export async function configureDrawAction(
  _prev: DrawState,
  formData: FormData
): Promise<DrawState> {
  try {
    requireAdmin(await getSession());
    const year = Number(formData.get("year"));
    const month = Number(formData.get("month"));
    const type = String(formData.get("type")) === "ALGORITHMIC" ? "ALGORITHMIC" : "RANDOM";
    const draw = await loadOrCreateDraw(year, month);
    if (draw.status === "PUBLISHED") {
      return { error: "Published draws cannot be reconfigured." };
    }
    const pool = await activePrizePoolPence();
    await prisma.draw.update({
      where: { id: draw.id },
      data: {
        type,
        prizePoolPence: pool.totalPence,
        jackpotCarryPence: pool.carryPence,
      },
    });
    revalidatePath("/admin/draws");
    return { success: `${monthLabel(year, month)} set to ${type.toLowerCase()} draw.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not configure the draw." };
  }
}

export async function simulateDrawAction(year: number, month: number): Promise<DrawState> {
  try {
    requireAdmin(await getSession());
    const draw = await loadOrCreateDraw(year, month);
    if (draw.status === "PUBLISHED") {
      return { error: "This draw is already published." };
    }
    const tickets = await eligibleTickets();
    const pool = await activePrizePoolPence();
    const result = runDraw({
      type: draw.type as "RANDOM" | "ALGORITHMIC",
      tickets,
      seed: `${draw.id}:${Date.now()}`,
    });
    await prisma.draw.update({
      where: { id: draw.id },
      data: {
        status: "SIMULATED",
        numbersJson: JSON.stringify(result.winningNumbers),
        prizePoolPence: pool.totalPence,
        jackpotCarryPence: pool.carryPence,
        simulatedAt: new Date(),
      },
    });
    revalidatePath("/admin/draws");
    return {
      success: `Simulation ready: ${result.winningNumbers.join(", ")}. ${result.matches.length} prize-tier match${result.matches.length === 1 ? "" : "es"}.`,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Simulation failed." };
  }
}

export async function publishDrawAction(year: number, month: number): Promise<DrawState> {
  try {
    requireAdmin(await getSession());
    const draw = await prisma.draw.findUnique({ where: { year_month: { year, month } } });
    if (!draw || draw.status !== "SIMULATED") {
      return { error: "Simulate the draw before publishing." };
    }
    const tickets = await eligibleTickets();
    const winning = JSON.parse(draw.numbersJson) as number[];
    const result = runDraw({
      type: draw.type as "RANDOM" | "ALGORITHMIC",
      tickets,
      seed: "unused",
    });
    // Re-score against the simulated numbers, not a new roll.
    result.winningNumbers = winning;
    result.matches = tickets
      .map((ticket) => ({
        userId: ticket.userId,
        numbers: ticket.numbers,
        matchCount: ticket.numbers.filter((n) => winning.includes(n)).length,
      }))
      .filter((row) => row.matchCount >= 3);

    const split = splitPrizePool(draw.prizePoolPence, result.matches);

    await prisma.$transaction(async (tx) => {
      await tx.win.deleteMany({ where: { drawId: draw.id } });
      if (split.awards.length) {
        await tx.win.createMany({
          data: split.awards.map((award) => ({
            drawId: draw.id,
            userId: award.userId,
            matchCount: award.matchCount,
            amountPence: award.amountPence,
          })),
        });
      }
      await tx.draw.update({
        where: { id: draw.id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
    });

    revalidatePath("/admin/draws");
    revalidatePath("/admin/winners");
    revalidatePath("/dashboard");
    return { success: `${monthLabel(year, month)} is live. ${split.awards.length} winner${split.awards.length === 1 ? "" : "s"} recorded.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not publish the draw." };
  }
}
