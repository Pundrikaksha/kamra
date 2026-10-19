import type { Requirement, SavedSearch, VisitItem } from "@/lib/types"

const VISITS = "kamra.visits.v1"
const SEARCHES = "kamra.searches.v1"
const EMAIL = "kamra.notify.v1"
export const THEME_KEY = "kamra.theme"
export const LANG_KEY = "kamra.lang"
export const RERUN_KEY = "kamra.rerun"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadVisits(): VisitItem[] {
  const items = read<VisitItem[]>(VISITS, [])
  return Array.isArray(items) ? items : []
}

export function saveVisits(items: VisitItem[]) {
  write(VISITS, items)
}

export function loadSearches(): SavedSearch[] {
  const items = read<SavedSearch[]>(SEARCHES, [])
  return Array.isArray(items) ? items : []
}

export function saveSearches(items: SavedSearch[]) {
  write(SEARCHES, items)
}

export function loadEmail(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(EMAIL) ?? ""
}

export function saveEmail(email: string) {
  localStorage.setItem(EMAIL, email)
}

export function queueRerun(requirement: Requirement) {
  sessionStorage.setItem(RERUN_KEY, JSON.stringify(requirement))
}

export function takeRerun(): Requirement | null {
  const raw = sessionStorage.getItem(RERUN_KEY)
  if (!raw) return null
  sessionStorage.removeItem(RERUN_KEY)
  try {
    return JSON.parse(raw) as Requirement
  } catch {
    return null
  }
}
