/** Pull a monthly rent figure out of a title or snippet. Returns null if none is stated. */
export function priceFromText(text: string): number | null {
  const range = text.match(
    /(?:₹|rs\.?\s*|inr\s*)\s*(\d{1,3}(?:,\d{2,3})+|\d+(?:\.\d+)?)\s*(k|thousand|lakh|lac)?/i
  )
  const bare = text.match(/(\d+(?:\.\d+)?)\s*(k)\b/i)
  const match = range ?? bare
  if (!match) return null
  const amount = Number(match[1].replace(/,/g, ""))
  if (!Number.isFinite(amount)) return null
  const unit = (match[2] ?? "").toLowerCase()
  let value = amount
  if (unit === "k" || unit === "thousand") value = amount * 1000
  if (unit === "lakh" || unit === "lac") value = amount * 100000
  if (!unit && amount < 1000) return null
  const rounded = Math.round(value)
  if (rounded < 500 || rounded > 2_000_000) return null
  return rounded
}

export function freshnessFromText(text: string): string | null {
  const match = text.match(/\b(\d{1,2}\s*(?:hour|hr|day|week)s?\s*ago|today|yesterday)\b/i)
  return match ? match[1] : null
}
