import "server-only"

import { connection } from "next/server"
import { clientIp, apiLimiter } from "@/lib/rate-limit"
import { clampUserText } from "@/lib/sanitize"
import { sanitizeRequirement } from "@/lib/requirement"
import type { Lang, Requirement } from "@/lib/types"
import { hasKamraPass } from "@/lib/auth"

export function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return Response.json({ error: code, message, ...extra }, { status })
}

export async function guard(request: Request): Promise<Response | null> {
  await connection()

  const hasPass = await hasKamraPass()
  const limit = apiLimiter.check(clientIp(request), hasPass)

  if (!limit.ok) {
    return jsonError(429, "rate_limited", "Too many searches from this network. Wait a few minutes and try again.", {
      retryAfterMs: limit.retryAfterMs,
    })
  }
  const length = Number(request.headers.get("content-length") || 0)
  if (length > 20_000) return jsonError(413, "too_long", "That request is too large.")
  return null
}

export async function readBody(request: Request): Promise<Record<string, unknown> | Response> {
  const raw = await request.text()
  if (raw.length > 20_000) return jsonError(413, "too_long", "That request is too large.")
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return jsonError(400, "bad_request", "Send a JSON object.")
    }
    return parsed as Record<string, unknown>
  } catch {
    return jsonError(400, "bad_request", "Send valid JSON.")
  }
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response
}

export function readLang(value: unknown): Lang {
  return value === "hi" ? "hi" : "en"
}

export function readHistory(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .slice(-8)
    .map((item) => clampUserText(item, 600))
    .filter((item): item is string => Boolean(item))
}

export function readRequirement(value: unknown): Requirement {
  return sanitizeRequirement(value)
}
