import { cookies } from "next/headers";
import { AUTH_COOKIE, SESSION_DAYS } from "./config";
import {
  readSessionToken,
  signSession,
  type SessionUser,
} from "./session-token";

export type { SessionUser };
export { readSessionToken, signSession };

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const jar = await cookies();
  const token = await signSession(user);
  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
}

export function requireUser(session: SessionUser | null): SessionUser {
  if (!session) {
    throw new Error("Sign in to continue.");
  }
  return session;
}

export function requireAdmin(session: SessionUser | null): SessionUser {
  const user = requireUser(session);
  if (user.role !== "ADMIN") {
    throw new Error("Administrator access required.");
  }
  return user;
}
