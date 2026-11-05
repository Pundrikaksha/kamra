import "server-only"
import { PropertyType, Requirement } from "@/lib/types"
import { expectedRent, isFarBelowNorm } from "@/lib/area-norms"
import { geminiEndpoint, DEFAULT_GEMINI_MODEL } from "@/lib/gemini"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL

export type ScamGuardResult = {
  riskScore: number // 0-100
  level: "low" | "medium" | "high"
  reasons: string[] // short, EN + optional HI
}

export type ScamGuardInput = {
  title: string
  price: number | null
  locality: string
  url: string
  snippet: string
  type?: PropertyType | null
  bhk?: number | null
}

const TOKEN_RE = /(token|visiting charge|visiting card|gate pass|society approval|refundable.{0,24}(fee|token|deposit)|advance\s*before\s*visit)/i
const OFFLINE_PAYMENT_RE = /\b(upi|gpay|google pay|phonepe|paytm|whatsapp)\b/i
const URGENCY_RE = /\b(urgent|hurry|last chance|only today|leaving city)\b/i
const ABROAD_RE = /\b(out of country|abroad|nri|overseas|not in india)\b/i
const NO_VISIT_RE = /\b(no visit|cannot visit|won'?t allow visit|pay first)\b/i

export async function analyzeScamRisk(
  listing: ScamGuardInput,
  requirement: Requirement,
  chatText?: string
): Promise<ScamGuardResult> {
  const inputBlob = `${listing.title} ${listing.snippet} ${chatText || ""}`.toLowerCase()

  if (GEMINI_API_KEY) {
    const prompt = `Analyze this rental property listing and optional owner chat for scam risk.
Output ONLY a JSON object with this exact structure: {"riskScore": number (0-100, 100 is highest risk), "level": "low" | "medium" | "high", "reasons": string[] (short explanations in English, can include Hindi if relevant)}.
Look out for requests for advance token payments before visits, prices that seem suspiciously low for the area, requests to pay off-platform via UPI/WhatsApp, false urgency, owners claiming to be abroad, or refusal to allow physical visits.

Listing Data:
Title: ${listing.title}
Price: ${listing.price || "Not specified"}
Locality: ${listing.locality}
Snippet: ${listing.snippet}
Owner Chat: ${chatText || "None"}
`

    try {
      const response = await fetch(geminiEndpoint(GEMINI_API_KEY, GEMINI_MODEL), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                riskScore: { type: "integer" },
                level: { type: "string", enum: ["low", "medium", "high"] },
                reasons: { type: "array", items: { type: "string" } }
              },
              required: ["riskScore", "level", "reasons"]
            }
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (textResponse) {
            try {
                return JSON.parse(textResponse) as ScamGuardResult
            } catch (e) {
                console.error("Failed to parse Gemini ScamGuard response:", e)
            }
        }
      }
    } catch (e) {
      console.error("Gemini ScamGuard API call failed:", e)
    }
  }

  // Rule-based fallback
  let riskScore = 0
  const reasons: string[] = []

  if (TOKEN_RE.test(inputBlob)) {
    riskScore += 40
    reasons.push("Asks for advance token before visit")
  }

  if (OFFLINE_PAYMENT_RE.test(inputBlob)) {
    riskScore += 30
    reasons.push("Off-platform payment request (UPI/WhatsApp)")
  }

  if (URGENCY_RE.test(inputBlob)) {
    riskScore += 20
    reasons.push("Creates false urgency")
  }

  if (ABROAD_RE.test(inputBlob)) {
    riskScore += 30
    reasons.push("Owner claims to be abroad")
  }

  if (NO_VISIT_RE.test(inputBlob)) {
    riskScore += 50
    reasons.push("Refuses physical visit before payment")
  }

  if (listing.price != null && listing.locality) {
    const expected = expectedRent(requirement, listing.locality, listing.type || requirement.type, listing.bhk || requirement.bhk)
    if (isFarBelowNorm(listing.price, expected)) {
      riskScore += 35
      reasons.push("Price is suspiciously below area median")
    }
  }

  riskScore = Math.min(100, riskScore)

  let level: "low" | "medium" | "high" = "low"
  if (riskScore >= 70) level = "high"
  else if (riskScore >= 40) level = "medium"

  if (reasons.length === 0) {
      reasons.push("No obvious scam indicators detected")
  }

  return { riskScore, level, reasons }
}
