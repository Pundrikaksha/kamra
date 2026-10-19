import "server-only"

import { acceptListingUrl, canonicalUrl } from "@/lib/platforms"
import { freshnessFromText, priceFromText } from "@/lib/price"
import { hashId } from "@/lib/hash"
import { formatINR } from "@/lib/format"
import { localityFromText } from "@/lib/gemini"
import { sanitizeUntrusted } from "@/lib/sanitize"
import { buildSearchQuery } from "@/lib/gemini"
import type { Listing, Requirement } from "@/lib/types"

type CseItem = { title?: string; snippet?: string; link?: string }

export async function searchCse(
  requirement: Requirement,
  key: string,
  cx: string,
  fetchImpl: typeof fetch
): Promise<Listing[]> {
  const url = new URL("https://www.googleapis.com/customsearch/v1")
  url.searchParams.set("key", key)
  url.searchParams.set("cx", cx)
  url.searchParams.set("q", buildSearchQuery(requirement))
  url.searchParams.set("num", "8")
  url.searchParams.set("gl", "in")
  const response = await fetchImpl(url.toString(), { signal: AbortSignal.timeout(15000) })
  if (!response.ok) {
    throw new Error(`Programmable Search returned ${response.status}`)
  }
  const payload = (await response.json()) as { items?: CseItem[] }
  const listings: Listing[] = []
  const seen = new Set<string>()
  for (const item of payload.items ?? []) {
    if (!item.link || !item.title) continue
    const accepted = acceptListingUrl(item.link, item.title)
    if (!accepted) continue
    const link = canonicalUrl(accepted.url)
    if (seen.has(link)) continue
    seen.add(link)
    const title = sanitizeUntrusted(item.title, 140)
    const snippet = sanitizeUntrusted(item.snippet || title, 220)
    const blob = `${title} ${snippet}`
    const price = priceFromText(blob)
    listings.push({
      id: hashId(link),
      title,
      price,
      priceText: price != null ? `${formatINR(price)} / month` : "",
      locality: localityFromText(blob),
      platform: accepted.platform,
      url: link,
      snippet,
      freshness: freshnessFromText(blob),
      demo: false,
      source: "programmable_search",
    })
  }
  return listings
}
