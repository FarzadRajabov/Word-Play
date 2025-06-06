import { type NextRequest, NextResponse } from "next/server"
import { fetchWordData } from "@/lib/dictionary-api"

export async function POST(request: NextRequest) {
  try {
    const { word } = await request.json()

    if (!word || typeof word !== "string") {
      return NextResponse.json({ success: false, error: "Word parameter is required" }, { status: 400 })
    }

    const result = await fetchWordData(word)

    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
