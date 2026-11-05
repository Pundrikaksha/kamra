import { captureAuthorization } from "@/lib/paypal"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { authorizationId } = await request.json()
    if (!authorizationId) {
      return NextResponse.json({ error: "Authorization ID is required" }, { status: 400 })
    }
    const captureData = await captureAuthorization(authorizationId)
    return NextResponse.json(captureData)
  } catch (error: any) {
    console.error("Failed to capture authorization:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
