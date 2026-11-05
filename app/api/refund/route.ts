import { refundPayment } from "@/lib/paypal"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { captureId, amount } = await request.json()
    if (!captureId) {
      return NextResponse.json({ error: "Capture ID is required" }, { status: 400 })
    }
    const refundData = await refundPayment(captureId, amount)
    return NextResponse.json(refundData)
  } catch (error: any) {
    console.error("Failed to process refund:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
