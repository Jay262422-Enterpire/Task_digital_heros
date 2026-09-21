import { SignJWT, jwtVerify } from "jose";
import { AUTH_COOKIE, SESSION_DAYS } from "./config";

export { AUTH_COOKIE };

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "digital-heroes-level-1-demo-secret"
  );
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .setSubject(user.id)
    .sign(secret());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      typeof payload.id === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      (payload.role === "USER" || payload.role === "ADMIN")
    ) {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}
