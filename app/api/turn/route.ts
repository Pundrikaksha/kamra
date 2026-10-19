import { guard, isResponse, jsonError, readBody, readHistory, readLang, readRequirement } from "@/lib/api"
import { clampUserText } from "@/lib/sanitize"
import { runTurn } from "@/lib/search-runner"

function publicError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Search failed"
  return message.replace(/key=[^&\s]+/gi, "key=redacted").slice(0, 200)
}

export async function POST(request: Request) {
  const blocked = await guard(request)
  if (blocked) return blocked
  const body = await readBody(request)
  if (isResponse(body)) return body

  const text = clampUserText(body.text, 600)
  if (!text) {
    return jsonError(400, "bad_request", "Tell Kamra the area, budget, and who the place is for.")
  }

  const asked =
    typeof body.askedCount === "number" && Number.isFinite(body.askedCount)
      ? Math.min(4, Math.max(0, Math.floor(body.askedCount)))
      : 0

  try {
    const result = await runTurn({
      text,
      history: readHistory(body.history),
      requirement: readRequirement(body.requirement),
      askedCount: asked,
      lang: readLang(body.lang),
    })
    return Response.json(result)
  } catch (error) {
    return jsonError(502, "search_failed", publicError(error))
  }
}
