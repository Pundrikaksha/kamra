import { NextResponse } from "next/server"
import { analyzeScamRisk } from "@/lib/scam-guard"
import { readRequirement } from "@/lib/api"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { listing, requirement, chatText } = body
    if (!listing || !requirement) {
        return NextResponse.json({ error: "Missing listing or requirement" }, { status: 400 })
    }
    const parsedRequirement = readRequirement(requirement)
    const result = await analyzeScamRisk(listing, parsedRequirement, chatText)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Scam guard failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
