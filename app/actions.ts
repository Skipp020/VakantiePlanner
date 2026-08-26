"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import {
  generateSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getCurrentMember,
} from "@/lib/session";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

/**
 * Cyclet de verlofstatus van de ingelogde gebruiker op een datum:
 * geen -> optie (1) -> bevestigd (2) -> geen. De huidige status wordt
 * altijd uit de database gelezen (nooit van de client aangenomen), zodat
 * dit ook onder gelijktijdige klikken correct blijft. Je kunt alleen je
 * eigen rij wijzigen: memberId komt uit het session-cookie, niet uit de
 * aanroep, dus dit kan niet worden misbruikt om andermans rij te wijzigen.
 */
export async function toggleLeaveDay(dateISO: string): Promise<ActionResult> {
  if (!ISO_DATE.test(dateISO)) return { error: "Ongeldige datum." };

  const member = await getCurrentMember();
  if (!member) return { error: "Je bent niet (meer) ingelogd." };

  const supabase = createServiceClient();

  const { data: existing, error: readError } = await supabase
    .from("leave_days")
    .select("status")
    .eq("member_id", member.id)
    .eq("date", dateISO)
    .maybeSingle();

  if (readError) {
    return { error: "Bijwerken is niet gelukt. Probeer het opnieuw." };
  }

  let mutationError = null;

  if (!existing) {
    ({ error: mutationError } = await supabase
      .from("leave_days")
      .insert({ member_id: member.id, date: dateISO, status: 1 }));
  } else if (existing.status === 1) {
    ({ error: mutationError } = await supabase
      .from("leave_days")
      .update({ status: 2 })
      .eq("member_id", member.id)
      .eq("date", dateISO));
  } else {
    ({ error: mutationError } = await supabase
      .from("leave_days")
      .delete()
      .eq("member_id", member.id)
      .eq("date", dateISO));
  }

  if (mutationError) {
    return { error: "Bijwerken is niet gelukt. Probeer het opnieuw." };
  }

  revalidatePath("/");
  return { error: null };
}
