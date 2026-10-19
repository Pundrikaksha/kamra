import { connection } from "next/server"
import { searchMode } from "@/lib/search-runner"
import { DEFAULT_GEMINI_MODEL } from "@/lib/gemini"

export async function GET() {
  await connection()
  return Response.json({
    mode: searchMode(),
    cse: Boolean(process.env.GOOGLE_CSE_KEY?.trim() && process.env.GOOGLE_CSE_CX?.trim()),
    model: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  })
}
