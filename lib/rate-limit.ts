type Bucket = number[]

export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, Bucket>()

  return {
    check(key: string, now = Date.now()) {
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

export const apiLimiter = createRateLimiter(16, 10 * 60 * 1000)

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim().slice(0, 64) || "local"
  return request.headers.get("x-real-ip")?.slice(0, 64) || "local"
}
