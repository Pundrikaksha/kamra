import { guard, isResponse, jsonError, readBody, readLang, readRequirement } from "@/lib/api"
import { templateDraft } from "@/lib/draft"
import { polishDraft } from "@/lib/live-search"
import { hasGeminiKey } from "@/lib/search-runner"
import { clampUserText } from "@/lib/sanitize"

function publicError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Could not draft the message"
  return message.replace(/key=[^&\s]+/gi, "key=redacted").slice(0, 200)
}

export async function POST(request: Request) {
  const blocked = await guard(request)
  if (blocked) return blocked
  const body = await readBody(request)
  if (isResponse(body)) return body

  const listing = body.listing
  if (!listing || typeof listing !== "object") {
    return jsonError(400, "bad_request", "Choose a listing first.")
  }
  const card = listing as Record<string, unknown>
  const title = clampUserText(card.title, 140)
  const url = clampUserText(card.url, 400)
  const platform = clampUserText(card.platform, 40) || "the site"
  const locality = clampUserText(card.locality, 80) || ""
  const price = typeof card.price === "number" && card.price >= 500 && card.price <= 2_000_000 ? Math.round(card.price) : null
  if (!title || !url?.startsWith("https://")) {
    return jsonError(400, "bad_request", "That listing does not have a usable link.")
  }

  const input = {
    requirement: readRequirement(body.requirement),
    listing: { title, url, platform, locality, price },
    lang: readLang(body.lang),
  }

  try {
    const text = hasGeminiKey() ? await polishDraft(input, { apiKey: process.env.GEMINI_API_KEY!.trim() }) : templateDraft(input)
    return Response.json({ text, sent: false })
  } catch (error) {
    return jsonError(502, "draft_failed", publicError(error))
  }
}
