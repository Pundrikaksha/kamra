import { createOrder } from "@/lib/paypal"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amount, currency } = await request.json()
    if (!amount) return NextResponse.json({ error: "Amount required" }, { status: 400 })
    const order = await createOrder(amount, currency || "USD", "AUTHORIZE")
    return NextResponse.json(order)
  } catch (error: any) {
    console.error("Failed to create authorize order:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
