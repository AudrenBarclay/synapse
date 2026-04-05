export const MAX_SHADOWING_GOALS_WORDS = 200;

export function countWords(text: string): number {
  if (text == null || typeof text !== "string") return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function truncateToWordLimit(text: string, maxWords: number): string {
  if (text == null || typeof text !== "string") return "";
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= maxWords) return parts.join(" ");
  return parts.slice(0, maxWords).join(" ");
}
