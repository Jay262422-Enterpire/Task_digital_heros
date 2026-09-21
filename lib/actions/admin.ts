"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";

export type AdminState = { error?: string; success?: string };

export async function adminUpdateUserAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  try {
    requireAdmin(await getSession());
    const userId = String(formData.get("userId"));
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const role = String(formData.get("role")) === "ADMIN" ? "ADMIN" : "USER";
    if (name.length < 2) return { error: "Name needs at least two characters." };
    if (!email.includes("@")) return { error: "Enter a valid email." };
    await prisma.user.update({ where: { id: userId }, data: { name, email, role } });
    revalidatePath("/admin/users");
    return { success: "User profile saved." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update user." };
  }
}

export async function adminResetPasswordAction(userId: string): Promise<AdminState> {
  try {
    requireAdmin(await getSession());
    const passwordHash = await bcrypt.hash("HeroPlay!26", 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: "Password reset to HeroPlay!26." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Reset failed." };
  }
}
