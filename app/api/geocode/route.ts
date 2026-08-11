import { NextResponse } from "next/server"
import { searchPlaces } from "@/lib/places"
import { BIRTH_PLACE_PRESETS } from "@/lib/birth-chart-types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") || "").trim()

  if (q.length < 2) {
    return NextResponse.json({
      results: [],
      presets: BIRTH_PLACE_PRESETS,
      meta: { provider: "none" },
    })
  }

  try {
    const { results, meta } = await searchPlaces(q)
    return NextResponse.json({
      results,
      presets: BIRTH_PLACE_PRESETS,
      meta,
    })
  } catch (err) {
    console.error("[Geocode/Places]", err)
    return NextResponse.json(
      {
        error: (err as Error).message || "Location lookup failed",
        results: [],
        presets: BIRTH_PLACE_PRESETS,
        meta: { provider: "none" },
      },
      { status: 500 },
    )
  }
}
