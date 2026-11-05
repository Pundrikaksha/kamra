import "server-only"
import { callGemini, textFromGemini } from "@/lib/gemini"

export async function generateReceipt(captureId: string, amount: string, reason: "pass" | "deposit"): Promise<{ text: string }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return {
      text: `[Mock Receipt]\nTransaction ID: ${captureId}\nAmount: ${amount}\nPurpose: Kamra ${reason === "pass" ? "Pass" : "Deposit"}\nStatus: Completed\n\n[रसीद]\nलेनदेन आईडी: ${captureId}\nराशि: ${amount}\nउद्देश्य: कमरा ${reason === "pass" ? "पास" : "जमा"}\nस्थिति: पूर्ण`
    }
  }

  const prompt = `Generate a plain text receipt for a PayPal capture.
Capture ID: ${captureId}
Amount: ${amount}
Reason: Kamra ${reason === "pass" ? "Pass" : "Protected Deposit"}

Provide a short, bilingual receipt in English and Hindi. Do not use markdown formatting. Keep it to 4-5 lines per language.`

  const body = {
    systemInstruction: { parts: [{ text: "You are a helpful assistant that generates plain text receipts in English and Hindi." }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1 },
  }

  try {
    const res = await callGemini(apiKey, body, fetch)
    const text = textFromGemini(res)
    return { text: text || "Receipt generation failed." }
  } catch (err: any) {
    console.error("Gemini receipt error", err)
    return { text: "Error generating receipt." }
  }
}

export async function generateDisputeDraft(captureId: string, reason: string): Promise<{ text: string }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return {
      text: `[Mock Dispute Draft]\nI would like to request a refund for transaction ${captureId}. Reason: ${reason || "Not provided"}`
    }
  }

  const prompt = `Draft a short, polite dispute/refund request message to PayPal for a recent capture.
Capture ID: ${captureId}
User's reason for refund: ${reason || "No specific reason provided"}

Keep it under 3 sentences. Return only the plain text message.`

  const body = {
    systemInstruction: { parts: [{ text: "You draft concise, polite refund requests." }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2 },
  }

  try {
    const res = await callGemini(apiKey, body, fetch)
    const text = textFromGemini(res)
    return { text: text || "Dispute draft generation failed." }
  } catch (err: any) {
    console.error("Gemini dispute error", err)
    return { text: "Error generating dispute draft." }
  }
}
