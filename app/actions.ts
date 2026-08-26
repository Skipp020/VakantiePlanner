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

function validateContract(hoursPerWeek: number, workingDays: number[]): string | null {
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0 || hoursPerWeek > 40) {
    return "Uren per week moet tussen 0 en 40 liggen.";
  }
  const uniqueDays = new Set(workingDays);
  const allValid = workingDays.every((d) => Number.isInteger(d) && d >= 1 && d <= 5);
  if (workingDays.length === 0 || !allValid || uniqueDays.size !== workingDays.length) {
    return "Kies minimaal 1 werkdag (ma-vr).";
  }
  return null;
}

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
export async function createMember(
  name: string,
  hoursPerWeek: number,
  workingDays: number[]
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Vul een naam in." };
  if (trimmed.length > 100) return { error: "Naam is te lang." };

  const contractError = validateContract(hoursPerWeek, workingDays);
  if (contractError) return { error: contractError };

  const supabase = createServiceClient();
  const token = generateSessionToken();

  const { error } = await supabase.from("members").insert({
    name: trimmed,
    session_token: token,
    hours_per_week: hoursPerWeek,
    working_days: workingDays,
  });

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
 * Werkt het contract (uren/week + gewerkte weekdagen) van de ingelogde
 * gebruiker bij. Alleen de eigen rij: memberId komt uit het session-cookie.
 */
export async function updateMemberSettings(
  hoursPerWeek: number,
  workingDays: number[]
): Promise<ActionResult> {
  const member = await getCurrentMember();
  if (!member) return { error: "Je bent niet (meer) ingelogd." };

  const contractError = validateContract(hoursPerWeek, workingDays);
  if (contractError) return { error: contractError };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("members")
    .update({ hours_per_week: hoursPerWeek, working_days: workingDays })
    .eq("id", member.id);

  if (error) {
    return { error: "Opslaan is niet gelukt. Probeer het opnieuw." };
  }

  revalidatePath("/");
  return { error: null };
}

/**
 * Verwijdert het eigen teamlid-account (en via ON DELETE CASCADE alle
 * eigen verlofdagen). Kan alleen de eigen rij treffen: memberId komt uit
 * het session-cookie, niet uit de aanroep.
 */
export async function deleteOwnAccount(): Promise<ActionResult> {
  const member = await getCurrentMember();
  if (!member) return { error: "Je bent niet (meer) ingelogd." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("members").delete().eq("id", member.id);

  if (error) {
    return { error: "Verwijderen is niet gelukt. Probeer het opnieuw." };
  }

  clearSessionCookie();
  revalidatePath("/");
  return { error: null };
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
