import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "student-forms";

export async function uploadStudentRequirementFile(
  supabase: SupabaseClient,
  studentId: string,
  requirementKey: string,
  file: File
): Promise<{ publicUrl: string } | { error: string }> {
  const safeName = file.name.replace(/[^\w.-]/g, "_");
  const path = `${studentId}/${requirementKey}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) {
    return { error: error.message };
  }
  const {
    data: { publicUrl }
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { publicUrl };
}
