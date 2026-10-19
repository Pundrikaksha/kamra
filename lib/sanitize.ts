/** Treat search snippets and user text as data, never as instructions. */
export function sanitizeUntrusted(input: string, max = 220): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

export function clampUserText(input: unknown, max: number): string | null {
  if (typeof input !== "string") return null
  const clean = sanitizeUntrusted(input, max)
  return clean.length ? clean : null
}
