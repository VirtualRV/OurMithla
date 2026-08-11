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

type TokenCache = { accessToken: string; expiresAt: number }
let tokenCache: TokenCache | null = null

function credentials() {
  const clientId = process.env.PROKERALA_CLIENT_ID?.trim() || ""
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET?.trim() || ""
  return { clientId, clientSecret }
}

export function isProkeralaConfigured(): boolean {
  const { clientId, clientSecret } = credentials()
  return Boolean(clientId && clientSecret)
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = credentials()
  assertConfigured(Boolean(clientId && clientSecret), "Prokerala credentials are not configured")

  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.accessToken
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  })

  const res = await fetch("https://api.prokerala.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Prokerala auth failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const json = (await res.json()) as {
    access_token?: string
    expires_in?: number
  }
  if (!json.access_token) throw new Error("Prokerala auth returned no access_token")

  tokenCache = {
    accessToken: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  }
  return json.access_token
}

async function prokeralaGet(path: string, params: Record<string, string>) {
  const token = await getAccessToken()
  const url = new URL(`https://api.prokerala.com${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg =
      (json as { errors?: Array<{ detail?: string }> })?.errors?.[0]?.detail ||
      JSON.stringify(json).slice(0, 240)
    throw new Error(`Prokerala ${path} failed (${res.status}): ${msg}`)
  }
  return json
}

function localIsoWithOffset(birthDate: string, birthTime: string, timeZoneId: string): string {
  const dt = DateTime.fromISO(`${birthDate}T${birthTime}`, { zone: timeZoneId })
  if (!dt.isValid) throw new Error(dt.invalidReason || "Invalid birth datetime")
  return dt.toISO({ suppressMilliseconds: true }) || dt.toUTC().toISO() || ""
}

export async function fetchProkeralaChart(req: ChartProviderRequest): Promise<ChartProviderResult> {
  const datetime = localIsoWithOffset(req.birthDate, req.birthTime, req.place.timeZoneId)
  const coordinates = `${req.place.lat},${req.place.lon}`
  const common = {
    ayanamsa: "1", // Lahiri
    coordinates,
    datetime,
  }

  const [planetPayload, kundliPayload] = await Promise.all([
    prokeralaGet("/v2/astrology/planet-position", common),
    prokeralaGet("/v2/astrology/kundli", common).catch(() => null),
  ])

  const planetList =
    (planetPayload as { data?: { planet_position?: unknown[] } })?.data?.planet_position ||
    (planetPayload as { data?: unknown[] })?.data ||
    []

  const planets: PlanetPlacement[] = []
  let lagna = rashiFromNameOrIndex(0)
  let lagnaDegree = 0
  let moonNak = "—"
  let moonPada = 1
  let moonDegree = 0

  for (const raw of planetList as Array<Record<string, unknown>>) {
    const name = String(raw.name || raw.planet || "")
    const sign = (raw.rasi || raw.sign || raw.zodiac) as
      | { id?: number; name?: string; lord?: unknown }
      | string
      | number
      | undefined
    const degree = Number(raw.degree ?? raw.longitude ?? 0)
    const house = Number(raw.house ?? raw.house_number ?? 1)
    const isAsc =
      name.toLowerCase().includes("asc") || name.toLowerCase().includes("lagna")

    const signName =
      typeof sign === "object" && sign
        ? String(sign.name || sign.id || "")
        : sign

    if (isAsc) {
      lagna = rashiFromNameOrIndex(signName as string | number)
      lagnaDegree = Number.isFinite(degree) ? +(degree % 30).toFixed(4) : 0
      continue
    }

    const id = mapPlanetId(name)
    if (!id) continue

    const rashi = rashiFromNameOrIndex(signName as string | number)
    planets.push(
      planetPlacement({
        id,
        longitude: degree,
        rashi,
        degreeInRashi: Number.isFinite(degree) ? +(degree % 30).toFixed(4) : 0,
        house: Number.isFinite(house) && house >= 1 && house <= 12 ? house : 1,
        retrograde: Boolean(raw.is_retrograde ?? raw.retrograde),
      }),
    )

    if (id === "Moon") {
      moonDegree = degree
      const nak = raw.nakshatra as { name?: string; pada?: number } | string | undefined
      if (typeof nak === "object" && nak) {
        moonNak = nak.name || moonNak
        moonPada = Number(nak.pada) || moonPada
      } else if (typeof nak === "string") {
        moonNak = nak
      }
    }
  }

  const kundliData = (kundliPayload as { data?: Record<string, unknown> } | null)?.data
  if (kundliData) {
    const nakDetails = kundliData.nakshatra_details as
      | {
          nakshatra?: { name?: string; pada?: number }
          chandra_rasi?: { name?: string }
          soorya_rasi?: { name?: string }
        }
      | undefined
    if (nakDetails?.nakshatra?.name) moonNak = nakDetails.nakshatra.name
    if (nakDetails?.nakshatra?.pada) moonPada = nakDetails.nakshatra.pada
  }

  const ensure = (id: PlanetId) => planets.find((p) => p.id === id)
  const sun = ensure("Sun")
  const moon = ensure("Moon")
  if (!sun || !moon) {
    throw new Error("Prokerala response missing Sun/Moon positions")
  }

  const chart = buildSkeletonChart({
    provider: "prokerala",
    name: req.name,
    birthDate: req.birthDate,
    birthTime: req.birthTime,
    place: req.place,
    lagna,
    lagnaDegree,
    sunRashi: sun.rashi,
    moonRashi: moon.rashi,
    nakshatra: moonNak,
    nakshatraPada: moonPada,
    moonDegree,
    planets,
    utcISO: datetime,
  })

  return {
    provider: "prokerala",
    providerLabel: "Prokerala Astrology API",
    chart,
    raw: { planetPosition: planetPayload, kundli: kundliPayload },
  }
}
