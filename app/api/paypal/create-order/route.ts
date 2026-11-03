import { createOrder } from "@/lib/paypal"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amount, currency } = await request.json()
    if (!amount || amount !== "4.99") return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    const order = await createOrder(amount, currency || "USD")
    return NextResponse.json(order)
  } catch (error: any) {
    console.error("Failed to create order:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
