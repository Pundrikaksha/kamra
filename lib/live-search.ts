import "server-only"

import { searchCse } from "@/lib/cse"
import {
  buildDraftBody,
  buildParseBody,
  buildSearchBody,
  callGemini,
  listingsFromGemini,
  requirementFromGemini,
  textFromGemini,
} from "@/lib/gemini"
import { canonicalUrl } from "@/lib/platforms"
import type { Listing, Requirement } from "@/lib/types"
import { acceptDraft, templateDraft, type DraftInput } from "@/lib/draft"

export type LiveDeps = {
  apiKey: string
  cseKey?: string
  cseCx?: string
  fetchImpl?: typeof fetch
  model?: string
}

function mergeListings(groups: Listing[][]): Listing[] {
  const seen = new Set<string>()
  const merged: Listing[] = []
  for (const group of groups) {
    for (const listing of group) {
      const url = canonicalUrl(listing.url)
      if (seen.has(url)) continue
      seen.add(url)
      merged.push({ ...listing, url })
    }
  }
  return merged
}

export async function searchLive(
  requirement: Requirement,
  deps: LiveDeps
): Promise<{ listings: Listing[]; sources: string[] }> {
  const fetchImpl = deps.fetchImpl ?? fetch
  const sources: string[] = []
  const groups: Listing[][] = []

  const gemini = await callGemini(
    deps.apiKey,
    buildSearchBody(requirement),
    fetchImpl,
    deps.model
  )
  const fromGemini = listingsFromGemini(gemini)
  if (fromGemini.length) {
    groups.push(fromGemini)
    sources.push("Google Search")
  }

  if (deps.cseKey && deps.cseCx) {
    const fromCse = await searchCse(requirement, deps.cseKey, deps.cseCx, fetchImpl)
    if (fromCse.length) {
      groups.push(fromCse)
      sources.push("Programmable Search")
    }
  }

  return { listings: mergeListings(groups), sources }
}

export async function parseWithGemini(
  text: string,
  deps: LiveDeps
): Promise<Requirement | null> {
  const fetchImpl = deps.fetchImpl ?? fetch
  const response = await callGemini(deps.apiKey, buildParseBody(text), fetchImpl, deps.model)
  return requirementFromGemini(response)
}

export async function polishDraft(input: DraftInput, deps: LiveDeps): Promise<string> {
  const fallback = templateDraft(input)
  try {
    const fetchImpl = deps.fetchImpl ?? fetch
    const response = await callGemini(
      deps.apiKey,
      buildDraftBody(fallback, input.lang),
      fetchImpl,
      deps.model
    )
    return acceptDraft(textFromGemini(response), fallback)
  } catch {
    return fallback
  }
}
