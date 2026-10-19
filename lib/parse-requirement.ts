import { emptyRequirement } from "@/lib/requirement"
import type { FoodPref, Furnishing, GenderPref, PropertyType, Requirement, TenantPref } from "@/lib/types"

type PlaceHint = {
  re: RegExp
  label: string
  city?: string
}

const CITIES: { name: string; keys: string[] }[] = [
  { name: "Greater Noida", keys: ["greater noida", "ग्रेटर नोएडा"] },
  { name: "Noida", keys: ["noida", "नोएडा"] },
  { name: "Ghaziabad", keys: ["ghaziabad", "गाजियाबाद"] },
  { name: "Gurgaon", keys: ["gurgaon", "gurugram", "गुड़गांव", "गुरुग्राम", "गुड़गांव"] },
  { name: "Faridabad", keys: ["faridabad", "फरीदाबाद"] },
  { name: "Delhi", keys: ["new delhi", "delhi", "दिल्ली"] },
  { name: "Bengaluru", keys: ["bengaluru", "bangalore", "बेंगलुरु", "बैंगलोर"] },
  { name: "Hyderabad", keys: ["hyderabad", "हैदराबाद"] },
  { name: "Mumbai", keys: ["mumbai", "bombay", "मुंबई"] },
  { name: "Chennai", keys: ["chennai", "madras", "चेन्नई"] },
  { name: "Kolkata", keys: ["kolkata", "calcutta", "कोलकाता"] },
  { name: "Pune", keys: ["pune", "पुणे"] },
  { name: "Indore", keys: ["indore", "इंदौर"] },
]

const PLACES: PlaceHint[] = [
  { re: /cyber\s*city|cyber\s*hub|साइबर\s*सिटी/i, label: "Cyber City", city: "Gurgaon" },
  { re: /udyog\s*vihar/i, label: "Udyog Vihar", city: "Gurgaon" },
  { re: /golf\s*course/i, label: "Golf Course Road", city: "Gurgaon" },
  { re: /sohna/i, label: "Sohna Road", city: "Gurgaon" },
  { re: /dlf\s*phase\s*[1-5]/i, label: "DLF Phase", city: "Gurgaon" },
  { re: /indirapuram/i, label: "Indirapuram", city: "Ghaziabad" },
  { re: /laxmi\s*nagar|लक्ष्मी\s*नगर/i, label: "Laxmi Nagar", city: "Delhi" },
  { re: /nehru\s*place/i, label: "Nehru Place", city: "Delhi" },
  { re: /connaught|cp\b/i, label: "Connaught Place", city: "Delhi" },
  { re: /aerocity/i, label: "Aerocity", city: "Delhi" },
  { re: /north\s*campus/i, label: "North Campus", city: "Delhi" },
  { re: /okhla/i, label: "Okhla", city: "Delhi" },
  { re: /saket/i, label: "Saket", city: "Delhi" },
  { re: /dwarka/i, label: "Dwarka", city: "Delhi" },
  { re: /vasant\s*kunj/i, label: "Vasant Kunj", city: "Delhi" },
  { re: /hsr(\s*layout)?/i, label: "HSR Layout", city: "Bengaluru" },
  { re: /koramangala/i, label: "Koramangala", city: "Bengaluru" },
  { re: /whitefield/i, label: "Whitefield", city: "Bengaluru" },
  { re: /indiranagar/i, label: "Indiranagar", city: "Bengaluru" },
  { re: /hinjewadi/i, label: "Hinjewadi", city: "Pune" },
  { re: /kothrud/i, label: "Kothrud", city: "Pune" },
  { re: /gachibowli/i, label: "Gachibowli", city: "Hyderabad" },
  { re: /hi-?tech\s*city|hitech\s*city/i, label: "Hitech City", city: "Hyderabad" },
  { re: /andheri/i, label: "Andheri", city: "Mumbai" },
  { re: /powai/i, label: "Powai", city: "Mumbai" },
]

const NOIDA_SECTORS = new Set([15, 16, 18, 62, 63, 76, 78, 104, 125, 126, 127, 128, 132, 135, 137, 142, 143, 150, 168])
const GURGAON_SECTORS = new Set([14, 44, 45, 46, 47, 48, 49, 50, 56, 57, 82, 83, 84])

function findCity(text: string): string | null {
  const lower = text.toLowerCase()
  for (const city of CITIES) {
    if (city.keys.some((key) => lower.includes(key))) return city.name
  }
  return null
}

function sectorCity(n: number, explicit: string | null): string | null {
  if (explicit) return null
  if (NOIDA_SECTORS.has(n) && !GURGAON_SECTORS.has(n)) return "Noida"
  if (n === 62 || n === 63) return "Noida"
  return null
}

function toRupees(amount: number, unit: string | undefined): number {
  const u = (unit ?? "").toLowerCase()
  if (u === "k" || u === "thousand" || u.includes("हज") || u.includes("हज़")) return Math.round(amount * 1000)
  if (u === "lakh" || u === "lac" || u === "लाख") return Math.round(amount * 100000)
  if (!unit && amount < 1000 && amount >= 3) return Math.round(amount * 1000)
  return Math.round(amount)
}

type MoneyHit = { value: number; index: number }

function findMoney(text: string): MoneyHit[] {
  const hits: MoneyHit[] = []
  const re =
    /(?:₹|rs\.?\s*|inr\s*)?\s*(\d{1,3}(?:,\d{2})+(?:,\d{3})*|\d+(?:\.\d+)?)\s*(k|thousand|lakh|lac|लाख|हज़ार|हजार)?/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    const raw = match[1].replace(/,/g, "")
    const amount = Number(raw)
    if (!Number.isFinite(amount)) continue
    const before = text.slice(Math.max(0, match.index - 12), match.index).toLowerCase()
    const after = text.slice(match.index + match[0].length, match.index + match[0].length + 12).toLowerCase()
    if (/sector\s*$/i.test(before)) continue
    if (/^\s*(min|mins|minute|minutes|मिनट|bhk|rk)\b/i.test(after)) continue
    if (/20(2[4-9]|3\d)/.test(raw) && !match[2] && !/[₹]|rs|inr|budget|rent/i.test(before)) continue
    const unit = match[2]
    const marked = /[₹]|rs|inr|budget|rent|under|below|upto|max|within/i.test(before) || Boolean(unit)
    const value = toRupees(amount, unit)
    if (value < 500 || value > 2_000_000) continue
    if (!marked && value < 1000) continue
    if (!unit && amount < 1000 && !marked) continue
    hits.push({ value, index: match.index })
  }
  return hits
}

function parseBudget(text: string): { min: number | null; max: number | null } {
  const range =
    /(\d+(?:\.\d+)?)\s*(k|thousand|lakh|lac|लाख|हज़ार|हजार)?\s*(?:-|–|to|से)\s*(\d+(?:\.\d+)?)\s*(k|thousand|lakh|lac|लाख|हज़ार|हजार)?/i
  const rangeMatch = text.match(range)
  if (rangeMatch && /budget|rent|₹|rs|under|between|से|तक|k|हज|हज़|lakh/i.test(rangeMatch[0] + text.slice(Math.max(0, (rangeMatch.index ?? 0) - 20), rangeMatch.index))) {
    const min = toRupees(Number(rangeMatch[1]), rangeMatch[2] || rangeMatch[4])
    const max = toRupees(Number(rangeMatch[3]), rangeMatch[4] || rangeMatch[2])
    if (min >= 500 && max >= min && max <= 2_000_000) return { min, max }
  }

  const hits = findMoney(text)
  if (!hits.length) return { min: null, max: null }
  const ceiling = /under|below|upto|up to|max|within|less than|के अंदर|से कम|तक|≤|<|under/i.test(text)
  const floor = /above|at least|minimum|min\b|से ऊपर|≥/i.test(text)
  if (hits.length >= 2 && !ceiling) {
    const sorted = [...hits].sort((a, b) => a.value - b.value)
    return { min: sorted[0].value, max: sorted[sorted.length - 1].value }
  }
  const value = hits[0].value
  if (floor && !ceiling) return { min: value, max: null }
  return { min: null, max: value }
}

function parseType(text: string): PropertyType | null {
  const lower = text.toLowerCase()
  if (/(\bpg\b|paying guest|पीजी|hostel)/i.test(text)) return "pg"
  if (/(flat\s*share|flatshare|flatmate|roommate|\bsharing\b|शेयर)/i.test(lower)) return "flat-share"
  if (/(single room|\broom\b|\b1\s*rk\b|कमरा)/i.test(lower)) return "room"
  if (/(\bflat\b|\bapartment\b|\bbhk\b|फ्लैट|बीएचके)/i.test(text)) return "flat"
  return null
}

function parseFurnishing(text: string): Furnishing | null {
  if (/unfurnished|without furniture|अनफर्निश/i.test(text)) return "unfurnished"
  if (/semi[-\s]?furnished|semifurnished|सेमी/i.test(text)) return "semi"
  if (/fully\s*furnished|furnished|फर्निश/i.test(text)) return "furnished"
  return null
}

function parseGender(text: string): GenderPref | null {
  if (/(female|women|ladies|girls|लड़किय|महिला)/i.test(text)) return "female"
  if (/(boys|male|men\b|लड़क)/i.test(text)) return "male"
  return null
}

function parseTenant(text: string): TenantPref | null {
  if (/(family|families|परिवार|फैमिली)/i.test(text)) return "family"
  if (/(bachelor)/i.test(text)) return "bachelor"
  return null
}

function parseFood(text: string): FoodPref | null {
  if (/non[-\s]?veg/i.test(text)) return "non-veg"
  if (/\bveg\b|vegetarian|शाकाहारी|वेज/i.test(text)) return "veg"
  return null
}

function parseMoveIn(text: string): string | null {
  if (/(immediately|asap|right away|this week|तुरंत|अभी)/i.test(text)) return "Immediately"
  if (/next month|अगले महीने/i.test(text)) return "Next month"
  const dated = text.match(
    /\b(\d{1,2}\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{1,2})\b/i
  )
  return dated ? dated[0] : null
}

function parseCommute(text: string): { target: string | null; minutes: number | null } {
  const match = text.match(
    /[≤<]?\s*(\d{1,3})\s*(?:min|mins|minutes|मिनट)\w*\s*(?:to|from|से)?\s+([^,.\n]{2,40})/i
  )
  if (!match) return { target: null, minutes: null }
  const minutes = Number(match[1])
  if (minutes < 5 || minutes > 180) return { target: null, minutes: null }
  const target = match[2].replace(/\bby\s+(metro|car|bus|bike)\b/i, "").trim()
  return { target: target.slice(0, 80) || null, minutes }
}

export function parseRequirement(text: string): Requirement {
  const requirement = emptyRequirement()
  if (!text.trim()) return requirement

  const explicitCity = findCity(text)
  requirement.city = explicitCity
  requirement.inferredCity = false

  const areas: string[] = []
  for (const place of PLACES) {
    if (place.re.test(text) && !areas.includes(place.label)) {
      areas.push(place.label)
      if (!requirement.city && place.city) {
        requirement.city = place.city
        requirement.inferredCity = true
      }
    }
  }

  const sectorRe = /(?:sector|सेक्टर)[\s-]*(\d{1,3})/gi
  let sector: RegExpExecArray | null
  while ((sector = sectorRe.exec(text))) {
    const n = Number(sector[1])
    const label = `Sector ${n}`
    if (!areas.includes(label)) areas.push(label)
    const inferred = sectorCity(n, explicitCity)
    if (inferred && !requirement.city) {
      requirement.city = inferred
      requirement.inferredCity = true
    }
  }

  requirement.areas = areas.slice(0, 4)
  if (/metro/i.test(text) && areas[0]) requirement.landmark = `${areas[0]} metro`

  const budget = parseBudget(text)
  requirement.budgetMin = budget.min
  requirement.budgetMax = budget.max

  requirement.type = parseType(text)
  const bhk = text.match(/(\d)\s*(?:bhk|बीएचके)/i)
  if (bhk) {
    requirement.bhk = Number(bhk[1])
    if (!requirement.type) requirement.type = "flat"
  }
  if (/1\s*rk/i.test(text) && !requirement.bhk) requirement.bhk = 1

  requirement.furnishing = parseFurnishing(text)
  requirement.gender = parseGender(text)
  requirement.tenant = parseTenant(text)
  requirement.food = parseFood(text)
  requirement.moveIn = parseMoveIn(text)

  const commute = parseCommute(text)
  requirement.commuteMinutes = commute.minutes
  requirement.commuteTarget = commute.target
  if (commute.target) {
    const fromTarget = parseRequirement(commute.target)
    if (!requirement.areas.length && fromTarget.areas.length) requirement.areas = fromTarget.areas
    if (!requirement.city && fromTarget.city) {
      requirement.city = fromTarget.city
      requirement.inferredCity = true
    }
  }

  return requirement
}
