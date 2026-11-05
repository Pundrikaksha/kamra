import { describe, it, expect } from "vitest"
import { signPassCookie, verifyPassCookie } from "@/lib/auth"

describe("lib/auth", () => {
  it("signs and verifies a cookie correctly", () => {
    const signed = signPassCookie("valid")
    expect(signed.startsWith("s:")).toBe(true)

    const verified = verifyPassCookie(signed)
    expect(verified).toBe("valid")
  })

  it("fails verification for a tampered cookie", () => {
    const signed = signPassCookie("valid")
    const tampered = signed + "tamper"

    const verified = verifyPassCookie(tampered)
    expect(verified).toBe(false)
  })

  it("fails verification for a cookie without prefix", () => {
    const verified = verifyPassCookie("just_some_value")
    expect(verified).toBe(false)
  })
})
