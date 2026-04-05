import type { SupabaseClient } from "@supabase/supabase-js";

export async function uploadProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ publicUrl: string } | { error: string }> {
  const path = `${userId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true
  });
  if (error) {
    return { error: error.message };
  }
  const {
    data: { publicUrl }
  } = supabase.storage.from("avatars").getPublicUrl(path);
  return { publicUrl };
}
