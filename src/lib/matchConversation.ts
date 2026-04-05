import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * After both student and doctor timestamps are set, create the single conversation for this match.
 */
export async function ensureConversationForMatch(
  supabase: SupabaseClient,
  matchId: string
): Promise<{ conversationId: string } | { error: string }> {
  const { data: m, error: mErr } = await supabase
    .from("matches")
    .select("id, student_id, doctor_id, student_accepted_at, doctor_accepted_at")
    .eq("id", matchId)
    .single();

  if (mErr || !m) {
    return { error: mErr?.message ?? "Match not found." };
  }
  if (!m.student_accepted_at || !m.doctor_accepted_at) {
    return { error: "Match is not mutual yet." };
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("match_id", matchId)
    .maybeSingle();

  if (existing?.id) {
    return { conversationId: existing.id };
  }

  const { data: conv, error: cErr } = await supabase
    .from("conversations")
    .insert({ match_id: matchId })
    .select("id")
    .single();

  if (cErr || !conv) {
    return { error: cErr?.message ?? "Could not create conversation." };
  }

  const { error: pErr } = await supabase.from("conversation_participants").insert([
    { conversation_id: conv.id, profile_id: m.student_id, unread_count: 0 },
    { conversation_id: conv.id, profile_id: m.doctor_id, unread_count: 0 }
  ]);

  if (pErr) {
    return { error: pErr.message };
  }

  return { conversationId: conv.id };
}
