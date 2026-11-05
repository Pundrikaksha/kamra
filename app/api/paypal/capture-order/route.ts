import { captureOrder } from "@/lib/paypal"
import { setKamraPassCookie } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }
    const captureData = await captureOrder(orderId)

    // If capture is successful, issue the pass
    if (captureData.status === "COMPLETED") {
      await setKamraPassCookie()
    }

    return NextResponse.json(captureData)
  } catch (error: any) {
    console.error("Failed to capture order:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
