import "server-only"
import type { ChartProviderRequest, ChartProviderResult } from "@/lib/astrology-providers/types"
import { assertConfigured } from "@/lib/astrology-providers/types"
import {
  buildSkeletonChart,
  mapPlanetId,
  planetPlacement,
  rashiFromNameOrIndex,
} from "@/lib/astrology-providers/normalize"
import type { PlanetId, PlanetPlacement } from "@/lib/birth-chart-types"

export function isFreeAstroApiConfigured(): boolean {
  return Boolean(process.env.FREEASTROAPI_KEY?.trim())
}

export async function fetchFreeAstroApiChart(
  req: ChartProviderRequest,
): Promise<ChartProviderResult> {
  const apiKey = process.env.FREEASTROAPI_KEY?.trim() || ""
  assertConfigured(Boolean(apiKey), "FreeAstroAPI key is not configured")

  const [y, m, d] = req.birthDate.split("-").map(Number)
  const [hour, minute] = req.birthTime.split(":").map(Number)

  const body = {
    year: y,
    month: m,
    day: d,
    hour,
    minute,
    city: req.place.city,
    lat: req.place.lat,
    lng: req.place.lon,
    tz_str: req.place.timeZoneId || "AUTO",
    ayanamsha: "lahiri",
  }

  const res = await fetch("https://api.freeastroapi.com/api/v2/vedic/chart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      `FreeAstroAPI chart failed (${res.status}): ${JSON.stringify(json).slice(0, 240)}`,
    )
  }

  const data = (json as { data?: Record<string, unknown> }).data || (json as Record<string, unknown>)
  const planetBlock =
    (data.planets as unknown[]) ||
    (data.grahas as unknown[]) ||
    ((data.chart as Record<string, unknown>)?.planets as unknown[]) ||
    []

  const planets: PlanetPlacement[] = []
  const ascObj = data.ascendant as { sign?: string; rasi?: string; degree?: number } | undefined
  const lagnaObj = data.lagna as { sign?: string; degree?: number } | undefined
  let lagna = rashiFromNameOrIndex(
    ascObj?.sign ||
      ascObj?.rasi ||
      lagnaObj?.sign ||
      (typeof data.ascendant_sign === "string" ? data.ascendant_sign : undefined) ||
      (typeof data.lagna_sign === "string" ? data.lagna_sign : undefined) ||
      0,
  )
  let lagnaDegree = Number(ascObj?.degree ?? lagnaObj?.degree ?? 0)
  let moonNak = String(
    (data.nakshatra as { name?: string })?.name || data.moon_nakshatra || "—",
  )
  let moonPada = Number((data.nakshatra as { pada?: number })?.pada || data.moon_pada || 1)
  let moonDegree = 0

  for (const raw of planetBlock as Array<Record<string, unknown>>) {
    const name = String(raw.name || raw.planet || raw.graha || "")
    const id = mapPlanetId(name)
    if (!id) continue
    const sign =
      (raw.sign as string) ||
      (raw.rasi as string) ||
      ((raw.rashi as { name?: string })?.name as string) ||
      ""
    const house = Number(raw.house || raw.bhava || 1)
    const deg = Number(raw.degree_in_sign ?? raw.degree ?? raw.longitude ?? 0)
    const lon = Number(raw.longitude ?? raw.full_degree ?? deg)

    const rashi = rashiFromNameOrIndex(sign || Math.floor(lon / 30))
    planets.push(
      planetPlacement({
        id,
        longitude: lon,
        rashi,
        degreeInRashi: +(deg % 30).toFixed(4),
        house: Number.isFinite(house) && house >= 1 && house <= 12 ? house : 1,
        retrograde: Boolean(raw.retrograde || raw.is_retrograde),
      }),
    )
    if (id === "Moon") {
      moonDegree = lon
      if (typeof raw.nakshatra === "string") moonNak = raw.nakshatra
      if (typeof raw.nakshatra === "object" && raw.nakshatra) {
        const n = raw.nakshatra as { name?: string; pada?: number }
        if (n.name) moonNak = n.name
        if (n.pada) moonPada = n.pada
      }
    }
  }

  // Some responses nest D1 chart signs only
  if (planets.length === 0 && data.d1) {
    const d1 = data.d1 as Record<string, unknown>
    for (const [key, val] of Object.entries(d1)) {
      const id = mapPlanetId(key)
      if (!id || typeof val !== "object" || !val) continue
      const v = val as Record<string, unknown>
      const rashi = rashiFromNameOrIndex(String(v.sign || v.rasi || ""))
      planets.push(
        planetPlacement({
          id,
          rashi,
          house: Number(v.house || 1),
          degreeInRashi: Number(v.degree || 0),
        }),
      )
    }
  }

  const ensure = (id: PlanetId) => planets.find((p) => p.id === id)
  const sun = ensure("Sun")
  const moon = ensure("Moon")
  if (!sun || !moon) {
    throw new Error("FreeAstroAPI response missing Sun/Moon — check API key / plan")
  }

  const chart = buildSkeletonChart({
    provider: "freeastroapi",
    name: req.name,
    birthDate: req.birthDate,
    birthTime: req.birthTime,
    place: req.place,
    lagna,
    lagnaDegree: Number.isFinite(lagnaDegree) ? +lagnaDegree.toFixed(4) : 0,
    sunRashi: sun.rashi,
    moonRashi: moon.rashi,
    nakshatra: moonNak,
    nakshatraPada: moonPada,
    moonDegree,
    planets,
  })

  return {
    provider: "freeastroapi",
    providerLabel: "FreeAstroAPI",
    chart,
    raw: json,
  }
}
