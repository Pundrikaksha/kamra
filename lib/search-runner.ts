import "server-only"

import { demoListings } from "@/lib/demo-listings"
import { parseWithGemini, searchLive } from "@/lib/live-search"
import { parseRequirement } from "@/lib/parse-requirement"
import { rankListings } from "@/lib/rank"
import { overlayRequirement, sanitizeRequirement } from "@/lib/requirement"
import { clarifyStep } from "@/lib/turn"
import type { Lang, Requirement, ScoredListing, SearchMode, TurnResult } from "@/lib/types"

export function hasGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim()
  return Boolean(key && key !== "your_key_here")
}

export function searchMode(): SearchMode {
  return hasGeminiKey() ? "live" : "demo"
}

function liveDeps() {
  return {
    apiKey: process.env.GEMINI_API_KEY!.trim(),
    cseKey: process.env.GOOGLE_CSE_KEY?.trim() || undefined,
    cseCx: process.env.GOOGLE_CSE_CX?.trim() || undefined,
    model: process.env.GEMINI_MODEL?.trim() || undefined,
  }
}

export async function understandText(
  corpus: string,
  base: Requirement
): Promise<{ requirement: Requirement; mode: SearchMode }> {
  const local = overlayRequirement(base, parseRequirement(corpus))
  if (!hasGeminiKey() || !corpus.trim()) return { requirement: local, mode: searchMode() }
  try {
    const extra = await parseWithGemini(corpus, liveDeps())
    if (!extra) return { requirement: local, mode: "live" }
    return { requirement: overlayRequirement(extra, local), mode: "live" }
  } catch {
    return { requirement: local, mode: "live" }
  }
}

export async function runSearch(
  requirement: Requirement,
  lang: Lang
): Promise<{
  status: "results"
  listings: ScoredListing[]
  mode: SearchMode
  sources: string[]
  notice: string | null
}> {
  const clean = sanitizeRequirement(requirement)
  if (!hasGeminiKey()) {
    return {
      status: "results",
      listings: rankListings(clean, demoListings(), lang),
      mode: "demo",
      sources: ["Sample cards"],
      notice:
        lang === "hi"
          ? "डेमो मोड। ये नमूना कार्ड हैं, किसी साइट से कॉपी की हुई लिस्टिंग नहीं।"
          : "Demo mode. These are sample cards, not listings copied from other sites.",
    }
  }

  const live = await searchLive(clean, liveDeps())
  const notice =
    live.listings.length === 0
      ? lang === "hi"
        ? "सर्च ने उन साइटों पर लिस्टिंग लिंक नहीं दिए। एरिया थोड़ा चौड़ा करके फिर कोशिश करें।"
        : "Search did not return listing links on the sites Kamra checks. Try a broader area."
      : null
  return {
    status: "results",
    listings: rankListings(clean, live.listings, lang),
    mode: "live",
    sources: live.sources,
    notice,
  }
}

export async function runTurn(input: {
  text: string
  history: string[]
  requirement: Requirement
  askedCount: number
  lang: Lang
}): Promise<TurnResult> {
  const corpus = [...input.history, input.text].filter(Boolean).join("\n")
  const understood = await understandText(corpus, input.requirement)
  const clarify = clarifyStep(understood.requirement, input.askedCount, input.lang)
  if (clarify) {
    return {
      status: "clarify",
      question: clarify.question,
      groups: clarify.groups,
      requirement: understood.requirement,
      askedCount: clarify.askedCount,
      mode: understood.mode,
    }
  }
  const searched = await runSearch(understood.requirement, input.lang)
  return {
    ...searched,
    requirement: understood.requirement,
    askedCount: input.askedCount,
  }
}
