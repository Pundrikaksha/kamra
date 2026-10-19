import { expectedRent, isFarBelowNorm } from "@/lib/area-norms"
import { formatINR } from "@/lib/format"
import type { Lang, Listing, Requirement, RiskCode, RiskLevel, ScoredListing } from "@/lib/types"

const BROKER_RE = /\b(broker|brokerage|commission|dealer|agent|property consultant|multiple options)\b|दलाल|दलाली/i
const BROKER_DENIAL =
  /no\s+broker(?:age)?|without\s+broker(?:age)?|zero\s+broker(?:age)?|brokerage[-\s]?free|बिना\s+दलाली/gi
const TOKEN_RE =
  /(token|visiting charge|visiting card|gate pass|society approval|refundable.{0,24}(fee|token|deposit))/i

function localityText(listing: Listing): string {
  return `${listing.locality} ${listing.title}`
}

function mentions(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function budgetPoints(requirement: Requirement, price: number | null): number {
  if (price == null) return 16
  const { budgetMin, budgetMax } = requirement
  if (budgetMax == null && budgetMin == null) return 22
  if (budgetMax != null && price <= budgetMax && (budgetMin == null || price >= budgetMin)) return 35
  if (budgetMin != null && price >= budgetMin && budgetMax == null && price <= budgetMin * 1.25) return 28
  if (budgetMax != null && price <= budgetMax * 1.15) return 20
  if (budgetMax != null && price <= budgetMax * 1.4) return 10
  return 4
}

function placePoints(requirement: Requirement, listing: Listing): number {
  const blob = localityText(listing)
  if (requirement.areas.some((area) => mentions(blob, area))) return 30
  if (requirement.commuteTarget && mentions(blob, requirement.commuteTarget)) return 26
  if (requirement.city && mentions(blob, requirement.city)) return 16
  if (!requirement.city && !requirement.areas.length) return 14
  return 4
}

function typePoints(requirement: Requirement, listing: Listing): number {
  if (!requirement.type) return 12
  const kind = listingKind(listing)
  if (kind === requirement.type) return 20
  if (requirement.type === "room" && kind === "flat-share") return 12
  if (requirement.type === "flat-share" && kind === "room") return 12
  return 4
}

function bhkPoints(requirement: Requirement, listing: Listing): number {
  if (!requirement.bhk) return 6
  const match = `${listing.title} ${listing.snippet}`.match(/(\d)\s*bhk/i)
  if (!match) return 4
  return Number(match[1]) === requirement.bhk ? 10 : 2
}

function preferencePoints(requirement: Requirement, listing: Listing): number {
  const blob = `${listing.title} ${listing.snippet}`.toLowerCase()
  let points = 0
  const female = /girl|female|women|ladies/.test(blob)
  const male = /\bboys?\b|\bmale\b|\bmen\b/.test(blob)
  if (requirement.gender === "female") {
    if (female) points += 8
    if (male) points -= 15
  }
  if (requirement.gender === "male") {
    if (male) points += 8
    if (female) points -= 15
  }
  if (requirement.food === "veg" && /\bveg\b/.test(blob)) points += 4
  if (requirement.tenant === "family" && /family/.test(blob)) points += 4
  return points
}

function furnishingPoints(requirement: Requirement, listing: Listing): number {
  if (!requirement.furnishing) return 3
  const blob = `${listing.title} ${listing.snippet}`.toLowerCase()
  if (requirement.furnishing === "semi" && /semi/.test(blob)) return 5
  if (requirement.furnishing === "furnished" && /furnish/.test(blob) && !/unfurnished|semi/.test(blob))
    return 5
  if (requirement.furnishing === "unfurnished" && /unfurnished/.test(blob)) return 5
  return 1
}

function listingBhk(listing: Listing): number | null {
  const match = `${listing.title} ${listing.snippet}`.match(/(\d)\s*bhk/i)
  return match ? Number(match[1]) : null
}

function listingKind(listing: Listing): Requirement["type"] {
  const blob = `${listing.title} ${listing.snippet}`.toLowerCase()
  if (/\bpg\b|paying guest/.test(blob)) return "pg"
  if (/share|flatmate|roommate/.test(blob)) return "flat-share"
  if (/\broom\b|1\s*rk/.test(blob)) return "room"
  return "flat"
}

function hasBrokerSignal(text: string): boolean {
  return BROKER_RE.test(text.replace(BROKER_DENIAL, " "))
}

export function detectRisks(requirement: Requirement, listing: Listing): RiskCode[] {
  const blob = `${listing.title} ${listing.snippet}`
  const risks: RiskCode[] = []
  if (hasBrokerSignal(blob)) risks.push("broker")
  if (TOKEN_RE.test(blob)) risks.push("token")
  if (listing.price != null) {
    const expected = expectedRent(requirement, listing.locality || blob, listingKind(listing), listingBhk(listing))
    if (isFarBelowNorm(listing.price, expected)) risks.push("below_norm")
  }
  return risks
}

function riskLevel(risks: RiskCode[]): RiskLevel {
  if (risks.includes("token") || risks.includes("below_norm")) return "high"
  if (risks.includes("broker") || risks.includes("duplicate")) return "medium"
  return "low"
}

function looksDuplicate(a: Listing, b: Listing): boolean {
  if (a.id === b.id || a.platform === b.platform) return false
  if (!a.locality || !b.locality || a.locality.toLowerCase() !== b.locality.toLowerCase()) return false
  if (a.price == null || b.price == null) return false
  const gap = Math.abs(a.price - b.price) / Math.max(a.price, b.price)
  if (gap > 0.08) return false
  if (listingKind(a) !== listingKind(b)) return false
  const aBhk = listingBhk(a)
  const bBhk = listingBhk(b)
  if (aBhk && bBhk && aBhk !== bBhk) return false
  return true
}

function whyFor(requirement: Requirement, listing: Listing, lang: Lang): string {
  const bits: string[] = []
  const place = listing.locality || requirement.areas[0] || requirement.city
  if (lang === "hi") {
    if (listing.price != null && requirement.budgetMax != null && listing.price <= requirement.budgetMax) {
      bits.push(`${formatINR(listing.price)} आपके बजट में है`)
    } else if (listing.price != null) {
      bits.push(`किराया ${formatINR(listing.price)} लिखा है`)
    }
    if (place) bits.push(place)
    if (requirement.bhk && new RegExp(`${requirement.bhk}\\s*bhk`, "i").test(listing.title + listing.snippet)) {
      bits.push(`${requirement.bhk}BHK`)
    }
    if (!bits.length) return "स्निपेट में यही मिलान दिखा। लिस्टिंग खोलकर खुद जाँचें।"
    return `${bits.join(" · ")}। आखिरी फैसला लिस्टिंग खोलकर लें।`
  }

  if (listing.price != null && requirement.budgetMax != null && listing.price <= requirement.budgetMax) {
    bits.push(`${formatINR(listing.price)} is inside your budget`)
  } else if (listing.price != null) {
    bits.push(`rent shown as ${formatINR(listing.price)}`)
  }
  if (requirement.areas.some((area) => mentions(localityText(listing), area))) {
    bits.push(`in ${requirement.areas.find((area) => mentions(localityText(listing), area))}`)
  } else if (place) {
    bits.push(place)
  }
  if (requirement.type === "pg") bits.push("PG")
  else if (requirement.type === "flat-share") bits.push("flat share")
  else if (requirement.bhk) bits.push(`${requirement.bhk}BHK`)
  if (!bits.length) return "Matched on the words in the search snippet. Open the listing and check it yourself."
  const sentence = bits.join(", ")
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + "."
}

export function rankListings(
  requirement: Requirement,
  listings: Listing[],
  lang: Lang = "en"
): ScoredListing[] {
  const duplicateIds = new Set<string>()
  for (let i = 0; i < listings.length; i++) {
    for (let j = i + 1; j < listings.length; j++) {
      if (looksDuplicate(listings[i], listings[j])) {
        duplicateIds.add(listings[i].id)
        duplicateIds.add(listings[j].id)
      }
    }
  }

  const scored = listings.map((listing) => {
    const risks = detectRisks(requirement, listing)
    if (duplicateIds.has(listing.id)) risks.push("duplicate")
    const level = riskLevel(risks)
    let score =
      budgetPoints(requirement, listing.price) +
      placePoints(requirement, listing) +
      typePoints(requirement, listing) +
      bhkPoints(requirement, listing) +
      furnishingPoints(requirement, listing) +
      preferencePoints(requirement, listing)
    if (level === "high") score -= 40
    else if (level === "medium") score -= 12
    return {
      ...listing,
      score: Math.max(0, Math.min(100, score)),
      why: whyFor(requirement, listing, lang),
      risks,
      riskLevel: level,
    }
  })

  const ordered = scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
  const top = ordered.slice(0, 10)
  const localWarning = ordered.find((item) => {
    if (item.riskLevel !== "high" || top.includes(item)) return false
    const blob = `${item.locality} ${item.title}`.toLowerCase()
    return requirement.areas.some((area) => blob.includes(area.toLowerCase()))
  })
  if (localWarning) {
    top[top.length - 1] = localWarning
  }
  return top
}
