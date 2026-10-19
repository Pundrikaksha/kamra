import type { PropertyType, Requirement } from "@/lib/types"

type Norm = {
  id: string
  match: RegExp
  city?: string
  flat1: number
  flat2: number
  flat3: number
  pg: number
  share: number
  room: number
}

/**
 * Rough 2026 monthly medians used only to flag prices far below the area.
 * They are not quoted as market facts on the cards.
 */
const PLACE_NORMS: Norm[] = [
  {
    id: "cyber-city",
    match: /cyber\s*city|cyber\s*hub|dlf\s*phase\s*[12]\b/i,
    city: "Gurgaon",
    flat1: 32000,
    flat2: 55000,
    flat3: 80000,
    pg: 18000,
    share: 22000,
    room: 18000,
  },
  {
    id: "gurgaon-central",
    match: /sector\s*(44|45|46|56|57)\b/i,
    city: "Gurgaon",
    flat1: 22000,
    flat2: 38000,
    flat3: 52000,
    pg: 14000,
    share: 16000,
    room: 14000,
  },
  {
    id: "sohna",
    match: /sector\s*(82|83|84)\b|sohna/i,
    city: "Gurgaon",
    flat1: 16000,
    flat2: 26000,
    flat3: 38000,
    pg: 10000,
    share: 12000,
    room: 10000,
  },
  {
    id: "noida-62",
    match: /sector\s*(62|63)\b/i,
    city: "Noida",
    flat1: 18000,
    flat2: 33000,
    flat3: 45000,
    pg: 11000,
    share: 14000,
    room: 12000,
  },
  {
    id: "noida-expressway",
    match: /sector\s*(12[5-9]|13[0-7]|142|143|150)\b/i,
    city: "Noida",
    flat1: 16000,
    flat2: 30000,
    flat3: 42000,
    pg: 10000,
    share: 13000,
    room: 11000,
  },
]

const CITY_NORMS: Record<string, Omit<Norm, "id" | "match" | "city">> = {
  Noida: { flat1: 17000, flat2: 30000, flat3: 42000, pg: 10000, share: 13000, room: 11000 },
  "Greater Noida": { flat1: 12000, flat2: 22000, flat3: 32000, pg: 8000, share: 10000, room: 9000 },
  Ghaziabad: { flat1: 12000, flat2: 22000, flat3: 30000, pg: 8000, share: 10000, room: 9000 },
  Gurgaon: { flat1: 22000, flat2: 40000, flat3: 55000, pg: 14000, share: 18000, room: 15000 },
  Delhi: { flat1: 18000, flat2: 35000, flat3: 50000, pg: 12000, share: 15000, room: 12000 },
  Faridabad: { flat1: 12000, flat2: 22000, flat3: 30000, pg: 8000, share: 10000, room: 8000 },
  Bengaluru: { flat1: 18000, flat2: 35000, flat3: 50000, pg: 12000, share: 15000, room: 12000 },
  Pune: { flat1: 15000, flat2: 28000, flat3: 40000, pg: 10000, share: 12000, room: 10000 },
  Hyderabad: { flat1: 15000, flat2: 28000, flat3: 40000, pg: 10000, share: 12000, room: 10000 },
  Mumbai: { flat1: 28000, flat2: 55000, flat3: 80000, pg: 15000, share: 20000, room: 16000 },
}

const DEFAULT_NORM = { flat1: 15000, flat2: 28000, flat3: 40000, pg: 10000, share: 12000, room: 10000 }

export function expectedRent(
  requirement: Requirement,
  locality: string,
  type: PropertyType | null,
  bhk: number | null
): number {
  const haystack = `${locality} ${requirement.areas.join(" ")} ${requirement.city ?? ""} ${requirement.commuteTarget ?? ""}`
  const place = PLACE_NORMS.find(
    (norm) =>
      norm.match.test(haystack) &&
      (!norm.city || !requirement.city || norm.city === requirement.city || norm.match.test(locality))
  )
  const city = requirement.city ? CITY_NORMS[requirement.city] : undefined
  const table = place ?? city ?? DEFAULT_NORM
  const kind = type ?? requirement.type

  if (kind === "pg") return table.pg
  if (kind === "flat-share") return table.share
  if (kind === "room") return table.room
  const rooms = bhk ?? requirement.bhk ?? 2
  if (rooms <= 1) return table.flat1
  if (rooms === 2) return table.flat2
  return table.flat3
}

export function isFarBelowNorm(price: number, expected: number): boolean {
  return price > 0 && price < expected * 0.55
}
