import { describe, expect, it } from "vitest"
import { parseRequirement } from "@/lib/parse-requirement"
import { clarifyStep } from "@/lib/turn"
import { overlayRequirement, sanitizeRequirement } from "@/lib/requirement"

describe("parseRequirement", () => {
  it("reads a Hinglish flat request", () => {
    const parsed = parseRequirement("2BHK under 25k near Sector 62 metro, family, semi-furnished")
    expect(parsed.bhk).toBe(2)
    expect(parsed.type).toBe("flat")
    expect(parsed.budgetMax).toBe(25000)
    expect(parsed.areas).toContain("Sector 62")
    expect(parsed.city).toBe("Noida")
    expect(parsed.inferredCity).toBe(true)
    expect(parsed.landmark).toBe("Sector 62 metro")
    expect(parsed.tenant).toBe("family")
    expect(parsed.furnishing).toBe("semi")
  })

  it("reads a commute, food, and gender request", () => {
    const parsed = parseRequirement(
      "single room, ≤₹15k, ≤35 min to Cyber City by metro, veg-friendly flatmates, female-only"
    )
    expect(parsed.budgetMax).toBe(15000)
    expect(parsed.commuteMinutes).toBe(35)
    expect(parsed.commuteTarget?.toLowerCase()).toContain("cyber city")
    expect(parsed.city).toBe("Gurgaon")
    expect(parsed.food).toBe("veg")
    expect(parsed.gender).toBe("female")
    expect(parsed.type === "room" || parsed.type === "flat-share").toBe(true)
  })

  it("reads Hindi", () => {
    const parsed = parseRequirement("सेक्टर 62 में 15 हजार के अंदर लड़कियों के लिए पीजी")
    expect(parsed.areas).toContain("Sector 62")
    expect(parsed.city).toBe("Noida")
    expect(parsed.budgetMax).toBe(15000)
    expect(parsed.gender).toBe("female")
    expect(parsed.type).toBe("pg")
  })

  it("drops caste and keeps the rest", () => {
    const parsed = parseRequirement("brahmin only girls pg in noida under 12k")
    expect(parsed.gender).toBe("female")
    expect(parsed.type).toBe("pg")
    expect(parsed.city).toBe("Noida")
    expect(JSON.stringify(parsed).toLowerCase()).not.toContain("brahmin")
  })

  it("parses a budget range", () => {
    const parsed = parseRequirement("3bhk furnished gurgaon sector 56 family budget 40000 to 55000")
    expect(parsed.bhk).toBe(3)
    expect(parsed.city).toBe("Gurgaon")
    expect(parsed.areas).toContain("Sector 56")
    expect(parsed.budgetMin).toBe(40000)
    expect(parsed.budgetMax).toBe(55000)
    expect(parsed.furnishing).toBe("furnished")
  })
})

describe("clarifyStep", () => {
  it("asks for place and budget, then stops after two asks", () => {
    const parsed = parseRequirement("need a room")
    const first = clarifyStep(parsed, 0, "en")
    expect(first?.groups.map((group) => group.id)).toEqual(["place", "budget"])
    expect(first?.askedCount).toBe(2)
    const second = clarifyStep(parsed, first!.askedCount, "en")
    expect(second).toBeNull()
  })

  it("does not ask when the sentence is already complete", () => {
    const parsed = parseRequirement("Girls PG under 12k in Noida")
    expect(clarifyStep(parsed, 0, "en")).toBeNull()
  })
})

describe("sanitizeRequirement", () => {
  it("rejects a tiny injected budget and unknown fields", () => {
    const clean = sanitizeRequirement({
      city: "Noida",
      budgetMax: 1,
      type: "flat",
      caste: "ignored",
      areas: ["Sector 62", 12, "x".repeat(200)],
    })
    expect(clean.budgetMax).toBeNull()
    expect(clean.city).toBe("Noida")
    expect(clean.type).toBe("flat")
    expect(clean.areas).toEqual(["Sector 62"])
    expect("caste" in clean).toBe(false)
  })

  it("lets an explicit local parse beat a model guess", () => {
    const local = parseRequirement("2BHK under 25k near Sector 62")
    const model = sanitizeRequirement({ budgetMax: 1, city: "Mumbai", type: "pg" })
    const merged = overlayRequirement(model, local)
    expect(merged.budgetMax).toBe(25000)
    expect(merged.city).toBe("Noida")
    expect(merged.type).toBe("flat")
  })
})
