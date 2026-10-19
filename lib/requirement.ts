import type { Furnishing, GenderPref, PropertyType, Requirement, TenantPref, FoodPref } from "@/lib/types"

const TYPES: PropertyType[] = ["flat", "pg", "flat-share", "room"]
const FURNISHING: Furnishing[] = ["furnished", "semi", "unfurnished"]
const GENDERS: GenderPref[] = ["female", "male", "any"]
const TENANTS: TenantPref[] = ["family", "bachelor", "any"]
const FOODS: FoodPref[] = ["veg", "non-veg"]

export function emptyRequirement(): Requirement {
  return {
    city: null,
    areas: [],
    landmark: null,
    budgetMin: null,
    budgetMax: null,
    type: null,
    bhk: null,
    furnishing: null,
    gender: null,
    tenant: null,
    moveIn: null,
    commuteTarget: null,
    commuteMinutes: null,
    food: null,
    inferredCity: false,
  }
}

function clipText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const clean = value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim()
  if (!clean) return null
  return clean.slice(0, max)
}

function money(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  const rounded = Math.round(value)
  if (rounded < 500 || rounded > 2_000_000) return null
  return rounded
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null
}

/** Drop unknown fields. Religion, caste, and community are never accepted. */
export function sanitizeRequirement(input: unknown): Requirement {
  const base = emptyRequirement()
  if (!input || typeof input !== "object") return base
  const raw = input as Record<string, unknown>

  const areas = Array.isArray(raw.areas)
    ? raw.areas
        .filter((area) => typeof area === "string" && area.trim().length > 0 && area.trim().length <= 80)
        .map((area) => clipText(area, 80))
        .filter((area): area is string => Boolean(area))
        .slice(0, 4)
    : []

  const bhk =
    typeof raw.bhk === "number" && raw.bhk >= 1 && raw.bhk <= 6 ? Math.round(raw.bhk) : null
  const minutes =
    typeof raw.commuteMinutes === "number" &&
    raw.commuteMinutes >= 5 &&
    raw.commuteMinutes <= 180
      ? Math.round(raw.commuteMinutes)
      : null

  return {
    city: clipText(raw.city, 40),
    areas,
    landmark: clipText(raw.landmark, 80),
    budgetMin: money(raw.budgetMin),
    budgetMax: money(raw.budgetMax),
    type: oneOf(raw.type, TYPES),
    bhk,
    furnishing: oneOf(raw.furnishing, FURNISHING),
    gender: oneOf(raw.gender, GENDERS),
    tenant: oneOf(raw.tenant, TENANTS),
    moveIn: clipText(raw.moveIn, 40),
    commuteTarget: clipText(raw.commuteTarget, 80),
    commuteMinutes: minutes,
    food: oneOf(raw.food, FOODS),
    inferredCity: raw.inferredCity === true,
  }
}

/**
 * `patch` wins when it has a value. A new ceiling clears a minimum that no
 * longer fits, so "under 20k" after a wider range stays coherent.
 */
export function overlayRequirement(base: Requirement, patch: Requirement): Requirement {
  let budgetMin = patch.budgetMin ?? base.budgetMin
  const budgetMax = patch.budgetMax ?? base.budgetMax
  if (
    patch.budgetMax != null &&
    patch.budgetMin == null &&
    budgetMin != null &&
    budgetMin > patch.budgetMax
  ) {
    budgetMin = null
  }

  return {
    city: patch.city ?? base.city,
    areas: patch.areas.length ? patch.areas : base.areas,
    landmark: patch.landmark ?? base.landmark,
    budgetMin,
    budgetMax,
    type: patch.type ?? base.type,
    bhk: patch.bhk ?? base.bhk,
    furnishing: patch.furnishing ?? base.furnishing,
    gender: patch.gender ?? base.gender,
    tenant: patch.tenant ?? base.tenant,
    moveIn: patch.moveIn ?? base.moveIn,
    commuteTarget: patch.commuteTarget ?? base.commuteTarget,
    commuteMinutes: patch.commuteMinutes ?? base.commuteMinutes,
    food: patch.food ?? base.food,
    inferredCity: patch.city ? patch.inferredCity : base.inferredCity,
  }
}

export function requirementLabel(requirement: Requirement): string {
  const bits: string[] = []
  if (requirement.bhk) bits.push(`${requirement.bhk}BHK`)
  if (requirement.type) bits.push(requirement.type)
  if (requirement.areas.length) bits.push(requirement.areas.join(", "))
  else if (requirement.city) bits.push(requirement.city)
  if (requirement.budgetMax) bits.push(`≤₹${requirement.budgetMax.toLocaleString("en-IN")}`)
  return bits.join(" · ") || "Saved search"
}
