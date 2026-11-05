import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("lib/receipts", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it("generateReceipt returns mock when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY
    const { generateReceipt } = await import("@/lib/receipts")

    const result = await generateReceipt("TEST_CAP_123", "10.00", "pass")
    expect(result.text).toContain("[Mock Receipt]")
    expect(result.text).toContain("TEST_CAP_123")
    expect(result.text).toContain("10.00")
  })

  it("generateDisputeDraft returns mock when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY
    const { generateDisputeDraft } = await import("@/lib/receipts")

    const result = await generateDisputeDraft("TEST_CAP_456", "Too small")
    expect(result.text).toContain("[Mock Dispute Draft]")
    expect(result.text).toContain("TEST_CAP_456")
    expect(result.text).toContain("Too small")
  })
})
