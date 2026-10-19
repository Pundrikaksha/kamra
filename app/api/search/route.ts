import { guard, isResponse, jsonError, readBody, readLang, readRequirement } from "@/lib/api"
import { runSearch } from "@/lib/search-runner"

function publicError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Search failed"
  return message.replace(/key=[^&\s]+/gi, "key=redacted").slice(0, 200)
}

export async function POST(request: Request) {
  const blocked = await guard(request)
  if (blocked) return blocked
  const body = await readBody(request)
  if (isResponse(body)) return body
  const requirement = readRequirement(body.requirement)
  if (!requirement.city && requirement.areas.length === 0 && requirement.budgetMax == null) {
    return jsonError(400, "bad_request", "Add a city or a budget before searching again.")
  }
  try {
    const result = await runSearch(requirement, readLang(body.lang))
    return Response.json({ ...result, requirement })
  } catch (error) {
    return jsonError(502, "search_failed", publicError(error))
  }
}
