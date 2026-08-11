import { NextResponse } from "next/server"
import { getSettings } from "@/lib/settings"
import { listAvailableProviders } from "@/lib/astrology-providers"
import {
  generateChartWithProvider,
} from "@/lib/astrology-providers"
import type { AstrologyProviderId } from "@/lib/astrology-providers/catalog"
import type { BirthPlace } from "@/lib/birth-chart-types"
import { resolveTimeZoneId } from "@/lib/places"

const PROVIDER_IDS = new Set<AstrologyProviderId>([
  "swiss",
  "prokerala",
  "astrologyapi",
  "freeastroapi",
])

export async function GET() {
  const settings = await getSettings()
  if (!settings.enableBirthChart) {
    return NextResponse.json({ providers: [], enableBirthChart: false })
  }
  return NextResponse.json({
    enableBirthChart: true,
    providers: listAvailableProviders(settings),
  })
}

export async function POST(request: Request) {
  try {
    const settings = await getSettings()
    if (!settings.enableBirthChart) {
      return NextResponse.json({ error: "Birth chart is currently disabled" }, { status: 403 })
    }

    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const birthDate = typeof body.birthDate === "string" ? body.birthDate.trim() : ""
    const birthTime = typeof body.birthTime === "string" ? body.birthTime.trim() : ""
    const placeId = typeof body.placeId === "string" ? body.placeId.trim() : ""
    const rawPlace = body.place
    const providerRaw = typeof body.provider === "string" ? body.provider.trim() : "swiss"
    const provider = (PROVIDER_IDS.has(providerRaw as AstrologyProviderId)
      ? providerRaw
      : "swiss") as AstrologyProviderId

    if (!birthDate || !birthTime) {
      return NextResponse.json({ error: "Birth date and time are required" }, { status: 400 })
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return NextResponse.json({ error: "Invalid birth date format" }, { status: 400 })
    }

    if (!/^\d{2}:\d{2}$/.test(birthTime)) {
      return NextResponse.json({ error: "Invalid birth time format" }, { status: 400 })
    }

    let place: BirthPlace | undefined
    if (rawPlace && typeof rawPlace === "object") {
      const lat = Number(rawPlace.lat)
      const lon = Number(rawPlace.lon)
      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        return NextResponse.json({ error: "Invalid place coordinates" }, { status: 400 })
      }

      const city =
        typeof rawPlace.city === "string" && rawPlace.city.trim() ? rawPlace.city.trim() : "Custom"
      const region =
        typeof rawPlace.region === "string" && rawPlace.region.trim()
          ? rawPlace.region.trim()
          : "—"
      const timeZoneId =
        typeof rawPlace.timeZoneId === "string" && rawPlace.timeZoneId.trim()
          ? rawPlace.timeZoneId.trim()
          : resolveTimeZoneId(lat, lon)

      place = {
        id: typeof rawPlace.id === "string" ? rawPlace.id : `custom_${lat}_${lon}`,
        city,
        region,
        lat,
        lon,
        timeZoneId,
      }
    }

    if (!place && !placeId) {
      return NextResponse.json({ error: "Please select a birth place" }, { status: 400 })
    }

    // Resolve preset placeId via Swiss path helpers when only placeId given
    const { BIRTH_PLACE_PRESETS } = await import("@/lib/birth-chart-types")
    if (!place && placeId) {
      place = BIRTH_PLACE_PRESETS.find((p) => p.id === placeId)
      if (!place) {
        return NextResponse.json({ error: "Unknown birth place" }, { status: 400 })
      }
    }

    const result = await generateChartWithProvider(
      provider,
      {
        name: name || "Seeker",
        birthDate,
        birthTime,
        place: place!,
      },
      settings,
    )

    return NextResponse.json({
      chart: result.chart,
      provider: result.provider,
      providerLabel: result.providerLabel,
      warnings: result.warnings,
      // Include raw only when client asks (keeps payload smaller by default)
      ...(body.includeRaw ? { raw: result.raw } : {}),
    })
  } catch (err) {
    console.error("[BirthChart]", err)
    return NextResponse.json(
      { error: (err as Error).message || "Failed to generate" },
      { status: 500 },
    )
  }
}
