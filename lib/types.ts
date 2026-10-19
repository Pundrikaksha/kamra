export type PropertyType = "flat" | "pg" | "flat-share" | "room"

export type Furnishing = "furnished" | "semi" | "unfurnished"

export type GenderPref = "female" | "male" | "any"

export type TenantPref = "family" | "bachelor" | "any"

export type FoodPref = "veg" | "non-veg"

export type Lang = "en" | "hi"

export type SearchMode = "demo" | "live"

export type Requirement = {
  city: string | null
  areas: string[]
  landmark: string | null
  budgetMin: number | null
  budgetMax: number | null
  type: PropertyType | null
  bhk: number | null
  furnishing: Furnishing | null
  gender: GenderPref | null
  tenant: TenantPref | null
  moveIn: string | null
  commuteTarget: string | null
  commuteMinutes: number | null
  food: FoodPref | null
  inferredCity: boolean
}

export type RiskCode = "broker" | "below_norm" | "token" | "duplicate"

export type RiskLevel = "low" | "medium" | "high"

export type Listing = {
  id: string
  title: string
  price: number | null
  priceText: string
  locality: string
  platform: string
  url: string
  snippet: string
  freshness: string | null
  demo: boolean
  source: "sample" | "google_search" | "programmable_search"
}

export type ScoredListing = Listing & {
  score: number
  why: string
  risks: RiskCode[]
  riskLevel: RiskLevel
}

export type ChipOption = {
  label: string
  utterance: string
}

export type ChipGroup = {
  id: "place" | "budget" | "type"
  prompt: string
  options: ChipOption[]
}

export type TurnResult =
  | {
      status: "clarify"
      question: string
      groups: ChipGroup[]
      requirement: Requirement
      askedCount: number
      mode: SearchMode
    }
  | {
      status: "results"
      requirement: Requirement
      listings: ScoredListing[]
      mode: SearchMode
      sources: string[]
      askedCount: number
      notice: string | null
    }

export type VisitItem = {
  id: string
  title: string
  url: string
  platform: string
  locality: string
  priceText: string
  when: string
  notes: string
  addedAt: string
}

export type SavedSearch = {
  id: string
  label: string
  requirement: Requirement
  savedAt: string
}
