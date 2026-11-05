import { describe, expect, it } from "vitest"

describe("scam-guard fallback rules", () => {
  it("detects token and offline payment requests", async () => {
    const { analyzeScamRisk } = await import("@/lib/scam-guard")
    const mockReq: any = {
      city: "Noida",
      areas: ["Sector 62"],
      landmark: null,
      budgetMin: null,
      budgetMax: 20000,
      type: "flat",
      bhk: 2,
      furnishing: null,
      gender: null,
      tenant: null,
      moveIn: null,
      commuteTarget: null,
      commuteMinutes: null,
      food: null,
      inferredCity: true
    }
    const listing = {
      title: "2BHK",
      price: 25000,
      locality: "Sector 62",
      url: "",
      snippet: "Pay 500 token visiting charge on GPay or whatsapp"
    }
    const result = await analyzeScamRisk(listing, mockReq)
    expect(result.riskScore).toBeGreaterThanOrEqual(70)
    expect(result.level).toBe("high")
    expect(result.reasons).toContain("Asks for advance token before visit")
    expect(result.reasons).toContain("Off-platform payment request (UPI/WhatsApp)")
  })

  it("detects suspiciously low price", async () => {
    const { analyzeScamRisk } = await import("@/lib/scam-guard")
    const mockReq: any = {
      city: "Noida",
      areas: ["Sector 62"],
      landmark: null,
      budgetMin: null,
      budgetMax: 20000,
      type: "flat",
      bhk: 2,
      furnishing: null,
      gender: null,
      tenant: null,
      moveIn: null,
      commuteTarget: null,
      commuteMinutes: null,
      food: null,
      inferredCity: true
    }
    const listing = {
      title: "2BHK",
      price: 5000, // median is around 33k for 2bhk in sector 62
      locality: "Sector 62",
      url: "",
      snippet: "Great flat"
    }
    const result = await analyzeScamRisk(listing, mockReq)
    expect(result.riskScore).toBeGreaterThan(0)
    expect(result.reasons).toContain("Price is suspiciously below area median")
  })

  it("returns low risk for normal listing", async () => {
    const { analyzeScamRisk } = await import("@/lib/scam-guard")
    const mockReq: any = {
      city: "Noida",
      areas: ["Sector 62"],
      landmark: null,
      budgetMin: null,
      budgetMax: 20000,
      type: "flat",
      bhk: 2,
      furnishing: null,
      gender: null,
      tenant: null,
      moveIn: null,
      commuteTarget: null,
      commuteMinutes: null,
      food: null,
      inferredCity: true
    }
    const listing = {
      title: "2BHK in Sector 62",
      price: 30000,
      locality: "Sector 62",
      url: "",
      snippet: "Semi furnished flat, family only."
    }
    const result = await analyzeScamRisk(listing, mockReq)
    expect(result.level).toBe("low")
    expect(result.riskScore).toBe(0)
  })
})
