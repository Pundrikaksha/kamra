import { voidAuthorization } from "@/lib/paypal"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { authorizationId } = await request.json()
    if (!authorizationId) {
      return NextResponse.json({ error: "Authorization ID is required" }, { status: 400 })
    }
    const data = await voidAuthorization(authorizationId)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Failed to void authorization:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
