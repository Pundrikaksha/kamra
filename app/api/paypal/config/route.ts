import { isMockMode } from "@/lib/paypal"
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    clientId: process.env.PAYPAL_CLIENT_ID || "mock-client-id",
    mockMode: isMockMode(),
  })
}
