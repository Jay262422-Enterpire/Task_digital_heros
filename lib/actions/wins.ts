"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";

export type WinState = { error?: string; success?: string };

export async function uploadProofAction(
  _prev: WinState,
  formData: FormData
): Promise<WinState> {
  const session = await getSession();
  if (!session) return { error: "Sign in to continue." };
  const winId = String(formData.get("winId") ?? "");
  const win = await prisma.win.findUnique({ where: { id: winId } });
  if (!win || win.userId !== session.id) {
    return { error: "Only the listed winner can upload proof." };
  }
  if (win.proofStatus === "APPROVED") {
    return { error: "This win is already verified." };
  }
  const file = formData.get("proof");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Attach a screenshot of your scores." };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { error: "Keep screenshots under 4MB." };
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !["png", "jpg", "jpeg", "webp"].includes(ext)) {
    return { error: "Upload a PNG, JPG, or WEBP screenshot." };
  }
  const dir = path.join(process.cwd(), "public", "uploads", "proofs");
  await mkdir(dir, { recursive: true });
  const filename = `${win.id}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  await prisma.win.update({
    where: { id: win.id },
    data: {
      proofPath: `/uploads/proofs/${filename}`,
      proofStatus: "SUBMITTED",
      proofNote: null,
    },
  });
  revalidatePath("/dashboard/winnings");
  revalidatePath("/admin/winners");
  return { success: "Proof submitted. An administrator will review it." };
}

export async function reviewProofAction(
  _prev: WinState,
  formData: FormData
): Promise<WinState> {
  try {
    requireAdmin(await getSession());
    const winId = String(formData.get("winId"));
    const decision = String(formData.get("decision"));
    const note = String(formData.get("note") ?? "").trim();
    if (decision !== "APPROVED" && decision !== "REJECTED") {
      return { error: "Choose approve or reject." };
    }
    await prisma.win.update({
      where: { id: winId },
      data: {
        proofStatus: decision,
        proofNote: note || (decision === "APPROVED" ? "Verified against stored scores." : "Please resubmit a clearer screenshot."),
        reviewedAt: new Date(),
      },
    });
    revalidatePath("/admin/winners");
    revalidatePath("/dashboard/winnings");
    return { success: decision === "APPROVED" ? "Winner verified." : "Proof rejected." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Review failed." };
  }
}

export async function markPaidAction(winId: string): Promise<WinState> {
  try {
    requireAdmin(await getSession());
    const win = await prisma.win.findUnique({ where: { id: winId } });
    if (!win) return { error: "Win not found." };
    if (win.proofStatus !== "APPROVED") {
      return { error: "Verify the winner before marking the payout as paid." };
    }
    await prisma.win.update({
      where: { id: winId },
      data: { payoutStatus: "PAID", paidAt: new Date() },
    });
    revalidatePath("/admin/winners");
    revalidatePath("/dashboard/winnings");
    return { success: "Payout marked as paid." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update payout." };
  }
}
