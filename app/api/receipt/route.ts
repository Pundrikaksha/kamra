import { generateReceipt, generateDisputeDraft } from "@/lib/receipts"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { captureId, amount, type, reason } = await request.json()

    if (!captureId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (type === "receipt") {
      const result = await generateReceipt(captureId, amount || "N/A", reason || "pass")
      return NextResponse.json(result)
    } else if (type === "dispute") {
      const result = await generateDisputeDraft(captureId, reason || "")
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error: any) {
    console.error("Receipt API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
