"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { MIN_CHARITY_PERCENT, MAX_CHARITY_PERCENT } from "@/lib/config";

export type CharityState = { error?: string; success?: string };

export async function saveCharityChoiceAction(
  _prev: CharityState,
  formData: FormData
): Promise<CharityState> {
  const session = await getSession();
  if (!session) return { error: "Sign in to continue." };
  const charityId = String(formData.get("charityId") ?? "");
  const percent = Number(formData.get("percent"));
  if (!Number.isInteger(percent) || percent < MIN_CHARITY_PERCENT || percent > MAX_CHARITY_PERCENT) {
    return { error: `Charity share must be between ${MIN_CHARITY_PERCENT}% and ${MAX_CHARITY_PERCENT}%.` };
  }
  const charity = await prisma.charity.findUnique({ where: { id: charityId } });
  if (!charity) return { error: "Choose a listed charity." };

  await prisma.charityChoice.upsert({
    where: { userId: session.id },
    update: { charityId, percent },
    create: { userId: session.id, charityId, percent },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/charity");
  return { success: `Now directing ${percent}% to ${charity.name}.` };
}

export async function donateAction(
  _prev: CharityState,
  formData: FormData
): Promise<CharityState> {
  const session = await getSession();
  const charityId = String(formData.get("charityId") ?? "");
  const email = String(formData.get("email") ?? session?.email ?? "").trim().toLowerCase();
  const pounds = Number(formData.get("amount"));
  const message = String(formData.get("message") ?? "").trim() || null;
  if (!email.includes("@")) return { error: "Enter an email for the receipt." };
  if (!Number.isFinite(pounds) || pounds < 1) return { error: "Donations start at £1." };
  const charity = await prisma.charity.findUnique({ where: { id: charityId } });
  if (!charity) return { error: "Choose a charity." };

  await prisma.donation.create({
    data: {
      userId: session?.id,
      charityId,
      email,
      amountPence: Math.round(pounds * 100),
      message,
    },
  });
  revalidatePath("/donate");
  revalidatePath("/charities");
  return { success: `Thank you. ${charity.name} will receive £${pounds.toFixed(2)}.` };
}

export async function adminSaveCharityAction(
  _prev: CharityState,
  formData: FormData
): Promise<CharityState> {
  const session = await getSession();
  if (session?.role !== "ADMIN") return { error: "Administrator access required." };
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    slug,
    tagline: String(formData.get("tagline") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    cause: String(formData.get("cause") ?? "community"),
    accent: String(formData.get("accent") ?? "#e8b86d").trim(),
    featured: formData.get("featured") === "on",
  };
  if (!data.name || !data.slug || !data.tagline || !data.description) {
    return { error: "Name, slug, tagline, and description are required." };
  }
  if (id) {
    await prisma.charity.update({ where: { id }, data });
  } else {
    await prisma.charity.create({ data });
  }
  revalidatePath("/admin/charities");
  revalidatePath("/charities");
  revalidatePath("/");
  return { success: "Charity saved." };
}

export async function adminDeleteCharityAction(id: string): Promise<CharityState> {
  const session = await getSession();
  if (session?.role !== "ADMIN") return { error: "Administrator access required." };
  const inUse = await prisma.charityChoice.count({ where: { charityId: id } });
  if (inUse > 0) {
    return { error: "This charity still has subscribers. Reassign them before deleting." };
  }
  await prisma.charityEvent.deleteMany({ where: { charityId: id } });
  await prisma.donation.deleteMany({ where: { charityId: id } });
  await prisma.charity.delete({ where: { id } });
  revalidatePath("/admin/charities");
  return { success: "Charity removed." };
}

export async function adminSaveEventAction(
  _prev: CharityState,
  formData: FormData
): Promise<CharityState> {
  const session = await getSession();
  if (session?.role !== "ADMIN") return { error: "Administrator access required." };
  const charityId = String(formData.get("charityId"));
  await prisma.charityEvent.create({
    data: {
      charityId,
      title: String(formData.get("title") ?? "").trim(),
      happensOn: new Date(String(formData.get("happensOn"))),
      location: String(formData.get("location") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
    },
  });
  revalidatePath("/admin/charities");
  return { success: "Event added." };
}
