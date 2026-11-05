import { authorizeOrder } from "@/lib/paypal"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }
    const data = await authorizeOrder(orderId)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Failed to authorize order:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
