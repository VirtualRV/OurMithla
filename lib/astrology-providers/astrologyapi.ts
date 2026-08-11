import "server-only"
import { DateTime } from "luxon"
import type { ChartProviderRequest, ChartProviderResult } from "@/lib/astrology-providers/types"
import { assertConfigured } from "@/lib/astrology-providers/types"
import {
  buildSkeletonChart,
  mapPlanetId,
  planetPlacement,
  rashiFromNameOrIndex,
} from "@/lib/astrology-providers/normalize"
import type { PlanetId, PlanetPlacement } from "@/lib/birth-chart-types"

function credentials() {
  const userId = process.env.ASTROLOGYAPI_USER_ID?.trim() || ""
  const apiKey = process.env.ASTROLOGYAPI_API_KEY?.trim() || ""
  return { userId, apiKey }
}

export function isAstrologyApiConfigured(): boolean {
  const { userId, apiKey } = credentials()
  return Boolean(userId && apiKey)
}

function authHeader(): string {
  const { userId, apiKey } = credentials()
  assertConfigured(Boolean(userId && apiKey), "AstrologyAPI credentials are not configured")
  return `Basic ${Buffer.from(`${userId}:${apiKey}`).toString("base64")}`
}

async function postJson(path: string, body: Record<string, unknown>) {
  const res = await fetch(`https://json.astrologyapi.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      "Accept-Language": "en",
    },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      `AstrologyAPI ${path} failed (${res.status}): ${JSON.stringify(json).slice(0, 240)}`,
    )
  }
  return json
}

function birthPayload(req: ChartProviderRequest) {
  const [y, m, d] = req.birthDate.split("-").map(Number)
  const [hour, min] = req.birthTime.split(":").map(Number)
  const dt = DateTime.fromISO(`${req.birthDate}T${req.birthTime}`, {
    zone: req.place.timeZoneId,
  })
  if (!dt.isValid) throw new Error(dt.invalidReason || "Invalid birth datetime")
  const tzone = dt.offset / 60

  return {
    day: d,
    month: m,
    year: y,
    hour,
    min,
    lat: req.place.lat,
    lon: req.place.lon,
    tzone,
    utcISO: dt.toUTC().toISO({ suppressMilliseconds: true }) || "",
  }
}

export async function fetchAstrologyApiChart(
  req: ChartProviderRequest,
): Promise<ChartProviderResult> {
  const payload = birthPayload(req)
  const { utcISO, ...body } = payload

  const [planetsRaw, birthDetails] = await Promise.all([
    postJson("planets", body),
    postJson("astro_details", body).catch(() => null),
  ])

  const list = Array.isArray(planetsRaw)
    ? planetsRaw
    : Array.isArray((planetsRaw as { planets?: unknown[] })?.planets)
      ? (planetsRaw as { planets: unknown[] }).planets
      : []

  const planets: PlanetPlacement[] = []
  let lagna = rashiFromNameOrIndex(0)
  let lagnaDegree = 0
  let moonNak = "—"
  let moonPada = 1
  let moonDegree = 0

  for (const raw of list as Array<Record<string, unknown>>) {
    const name = String(raw.name || "")
    const isAsc = name.toLowerCase().includes("ascendant") || name.toLowerCase() === "asc"
    const sign = String(raw.sign || raw.rasi || "")
    const fullDegree = Number(raw.fullDegree ?? raw.normDegree ?? raw.longitude ?? 0)
    const deg = Number(raw.normDegree ?? (fullDegree % 30))
    const house = Number(raw.house ?? 1)

    if (isAsc) {
      lagna = rashiFromNameOrIndex(sign)
      lagnaDegree = Number.isFinite(deg) ? +deg.toFixed(4) : 0
      continue
    }

    const id = mapPlanetId(name)
    if (!id) continue

    const rashi = rashiFromNameOrIndex(sign)
    planets.push(
      planetPlacement({
        id,
        longitude: fullDegree,
        rashi,
        degreeInRashi: Number.isFinite(deg) ? +deg.toFixed(4) : 0,
        house: Number.isFinite(house) && house >= 1 && house <= 12 ? house : 1,
        retrograde: Boolean(raw.isRetro || raw.retrograde),
        dignity: typeof raw.signLord === "string" ? String(raw.signLord) : "—",
      }),
    )

    if (id === "Moon") {
      moonDegree = fullDegree
      if (typeof raw.nakshatra === "string") moonNak = raw.nakshatra
      if (typeof raw.nakshatraPad === "number") moonPada = raw.nakshatraPad
      if (typeof raw.nakshatra_pada === "number") moonPada = raw.nakshatra_pada as number
    }
  }

  const details = birthDetails as Record<string, unknown> | null
  if (details) {
    if (typeof details.naksahtra === "string") moonNak = details.naksahtra // API typo in some docs
    if (typeof details.nakshatra === "string") moonNak = details.nakshatra
    if (typeof details.ascendant === "string") lagna = rashiFromNameOrIndex(details.ascendant)
  }

  const ensure = (id: PlanetId) => planets.find((p) => p.id === id)
  const sun = ensure("Sun")
  const moon = ensure("Moon")
  if (!sun || !moon) {
    throw new Error("AstrologyAPI response missing Sun/Moon positions")
  }

  const chart = buildSkeletonChart({
    provider: "astrologyapi",
    name: req.name,
    birthDate: req.birthDate,
    birthTime: req.birthTime,
    place: { ...req.place, tzOffsetHours: payload.tzone },
    lagna,
    lagnaDegree,
    sunRashi: sun.rashi,
    moonRashi: moon.rashi,
    nakshatra: moonNak,
    nakshatraPada: moonPada,
    moonDegree,
    planets,
    utcISO,
  })

  return {
    provider: "astrologyapi",
    providerLabel: "AstrologyAPI.com (VedicRishi)",
    chart,
    raw: { planets: planetsRaw, astroDetails: birthDetails },
  }
}
