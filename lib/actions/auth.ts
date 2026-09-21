"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { clearSessionCookie, getSession, setSessionCookie } from "@/lib/auth";
import { MIN_CHARITY_PERCENT, MAX_CHARITY_PERCENT } from "@/lib/config";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least two characters.").max(80),
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password needs at least 8 characters."),
  charityId: z.string().min(1, "Choose a charity."),
  percent: z.coerce.number().int().min(MIN_CHARITY_PERCENT).max(MAX_CHARITY_PERCENT),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type ActionState = { error?: string; success?: string };

export async function signupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    charityId: formData.get("charityId"),
    percent: formData.get("percent"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existing) {
    return { error: "An account already exists for that email. Sign in instead." };
  }

  const charity = await prisma.charity.findUnique({ where: { id: parsed.data.charityId } });
  if (!charity) {
    return { error: "That charity is no longer listed." };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      charityChoice: {
        create: { charityId: charity.id, percent: parsed.data.percent },
      },
    },
  });

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: "USER",
  });
  redirect("/subscribe?from=signup");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter your email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user) {
    return { error: "Those details did not match an account." };
  }
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return { error: "Those details did not match an account." };
  }

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
  });
  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Sign in to continue." };
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Name needs at least two characters." };
  await prisma.user.update({ where: { id: session.id }, data: { name } });
  await setSessionCookie({ ...session, name });
  return { success: "Profile updated." };
}
