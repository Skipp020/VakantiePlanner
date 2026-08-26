import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import type { MemberRow } from "@/lib/types";

export const SESSION_COOKIE = "vp_session_token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 jaar

export type Member = MemberRow;

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

/**
 * Resolves the current member from the session cookie. Returns null when
 * there is no cookie, or when it no longer matches a member (e.g. someone
 * else logged in on the same name and rotated the token).
 */
export async function getCurrentMember(): Promise<Member | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, name, hours_per_week, working_days")
    .eq("session_token", token)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
