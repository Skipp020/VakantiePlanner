"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import {
  generateSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/session";

export type ActionResult = { error: string } | { error: null };

/**
 * "Inloggen" op een bestaand teamlid: geeft de rij een nieuw random
 * session_token en zet dat in het cookie van deze browser. Een eerder
 * geopende sessie voor datzelfde lid (andere browser) wordt hiermee
 * automatisch ongeldig, zodat er nooit twee geldige tokens naast elkaar
 * bestaan.
 */
export async function selectMember(memberId: string): Promise<ActionResult> {
  if (!memberId) return { error: "Kies een naam." };

  const supabase = createServiceClient();
  const token = generateSessionToken();

  const { error } = await supabase
    .from("members")
    .update({ session_token: token })
    .eq("id", memberId);

  if (error) {
    return { error: "Inloggen is niet gelukt. Probeer het opnieuw." };
  }

  setSessionCookie(token);
  revalidatePath("/");
  return { error: null };
}

/**
 * Voegt een nieuw teamlid toe en logt daar direct mee in.
 */
export async function createMember(name: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Vul een naam in." };
  if (trimmed.length > 100) return { error: "Naam is te lang." };

  const supabase = createServiceClient();
  const token = generateSessionToken();

  const { error } = await supabase
    .from("members")
    .insert({ name: trimmed, session_token: token });

  if (error) {
    if (error.code === "23505") {
      return { error: "Deze naam bestaat al. Kies 'm uit de lijst." };
    }
    return { error: "Toevoegen is niet gelukt. Probeer het opnieuw." };
  }

  setSessionCookie(token);
  revalidatePath("/");
  return { error: null };
}

export async function logout(): Promise<void> {
  clearSessionCookie();
  revalidatePath("/");
}
