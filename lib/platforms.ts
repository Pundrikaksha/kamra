export const LISTING_SITES = [
  { host: "nobroker.in", name: "NoBroker" },
  { host: "magicbricks.com", name: "Magicbricks" },
  { host: "99acres.com", name: "99acres" },
  { host: "housing.com", name: "Housing.com" },
  { host: "squareyards.com", name: "Square Yards" },
  { host: "nestaway.com", name: "NestAway" },
  { host: "flatmate.in", name: "Flatmate.in" },
  { host: "flatmates.com", name: "Flatmates" },
  { host: "olx.in", name: "OLX" },
  { host: "zolostays.com", name: "Zolo" },
  { host: "stanzaliving.com", name: "Stanza Living" },
  { host: "facebook.com", name: "Facebook" },
] as const

const REDIRECT_HOSTS = new Set([
  "vertexaisearch.cloud.google.com",
  "www.google.com",
  "google.com",
])

export function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return null
  }
}

export function platformForHost(host: string): string | null {
  const match = LISTING_SITES.find((site) => host === site.host || host.endsWith(`.${site.host}`))
  return match?.name ?? null
}

export function platformFromTitle(title: string): string | null {
  const text = title.toLowerCase()
  for (const site of LISTING_SITES) {
    const token = site.name.toLowerCase().replace(".com", "").replace(".in", "")
    if (text.includes(token) || text.includes(site.host)) return site.name
  }
  return null
}

/**
 * Accept a direct listing-site URL, or a Google grounding redirect whose
 * title names one of those sites. Anything else is dropped.
 */
export function acceptListingUrl(
  url: string,
  title: string
): { url: string; platform: string } | null {
  if (!url.startsWith("https://")) return null
  const host = hostOf(url)
  if (!host) return null
  const direct = platformForHost(host)
  if (direct) return { url, platform: direct }
  if (REDIRECT_HOSTS.has(host)) {
    const named = platformFromTitle(title)
    if (named) return { url, platform: named }
  }
  return null
}

export function canonicalUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.hash = ""
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      parsed.searchParams.delete(key)
    }
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.slice(0, -1)
    }
    return parsed.toString()
  } catch {
    return url
  }
}

export function siteQuery(): string {
  return LISTING_SITES.filter((site) => site.host !== "facebook.com")
    .map((site) => `site:${site.host}`)
    .join(" OR ")
}
