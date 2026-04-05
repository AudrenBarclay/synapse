/** Split comma/newline-separated user input into a clean string array. */
export function parseTagList(input: string): string[] {
  return input
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinTagList(tags: string[]): string {
  return tags.join(", ");
}
