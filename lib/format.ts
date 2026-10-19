export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`
}

export function formatBudget(min: number | null, max: number | null, lang: "en" | "hi"): string {
  if (min && max) return `${formatINR(min)}–${formatINR(max)}`
  if (max) return lang === "hi" ? `${formatINR(max)} तक` : `Under ${formatINR(max)}`
  if (min) return lang === "hi" ? `${formatINR(min)} से ऊपर` : `Above ${formatINR(min)}`
  return lang === "hi" ? "बजट खुला" : "Any budget"
}
