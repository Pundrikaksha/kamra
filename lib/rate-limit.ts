type Bucket = number[]

export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, Bucket>()

  return {
    check(key: string, skipLimit: boolean = false, now = Date.now()) {
      if (skipLimit) return { ok: true as const, retryAfterMs: 0 }

      const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs)
      if (recent.length >= limit) {
        hits.set(key, recent)
        const retryAfterMs = windowMs - (now - recent[0])
        return { ok: false as const, retryAfterMs }
      }
      recent.push(now)
      hits.set(key, recent)
      return { ok: true as const, retryAfterMs: 0 }
    },
  }
}

// 4 searches allowed per 10 minutes without pass
export const apiLimiter = createRateLimiter(4, 10 * 60 * 1000)

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim().slice(0, 64) || "local"
  return request.headers.get("x-real-ip")?.slice(0, 64) || "local"
}
