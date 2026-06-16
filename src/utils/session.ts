import "server-only";
import { cookies } from "next/headers";
import { SessionPayload } from "@/types/session";

const COOKIE_NAME = "auth-token";
const MAX_AGE = 24 * 60 * 60; // 24 hours

export async function createSession(payload: SessionPayload) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<SessionPayload | undefined> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;

  if (!value) return undefined;

  try {
    return JSON.parse(value) as SessionPayload;
  } catch {
    return undefined;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
