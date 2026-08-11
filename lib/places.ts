import "server-only"
import { find as findTimeZones } from "geo-tz"
import type { BirthPlace } from "@/lib/birth-chart-types"

export type PlaceSearchResult = BirthPlace & {
  label: string
  provider: "google" | "geonames" | "preset"
}

function ianaFromCoords(lat: number, lon: number): string {
  const zones = findTimeZones(lat, lon)
  return zones[0] || "UTC"
}

function regionFromParts(parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join(", ")
}

/** Google Places Autocomplete (New) + Place Details — best global quality. */
async function searchGooglePlaces(query: string, apiKey: string): Promise<PlaceSearchResult[]> {
  const autoRes = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify({
      input: query,
      includedPrimaryTypes: ["locality", "administrative_area_level_3", "sublocality", "postal_code"],
    }),
  })

  if (!autoRes.ok) {
    const text = await autoRes.text()
    throw new Error(`Google Places autocomplete failed (${autoRes.status}): ${text.slice(0, 180)}`)
  }

  const autoJson = (await autoRes.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string
        text?: { text?: string }
        structuredFormat?: {
          mainText?: { text?: string }
          secondaryText?: { text?: string }
        }
      }
    }>
  }

  const predictions = (autoJson.suggestions || [])
    .map((s) => s.placePrediction)
    .filter(Boolean)
    .slice(0, 8)

  const details = await Promise.all(
    predictions.map(async (pred) => {
      const placeId = pred!.placeId
      if (!placeId) return null

      const detailRes = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,displayName,formattedAddress,location,addressComponents",
        },
      })
      if (!detailRes.ok) return null
      const place = (await detailRes.json()) as {
        id?: string
        displayName?: { text?: string }
        formattedAddress?: string
        location?: { latitude?: number; longitude?: number }
        addressComponents?: Array<{
          longText?: string
          shortText?: string
          types?: string[]
        }>
      }

      const lat = place.location?.latitude
      const lon = place.location?.longitude
      if (typeof lat !== "number" || typeof lon !== "number") return null

      const comps = place.addressComponents || []
      const findType = (t: string) => comps.find((c) => c.types?.includes(t))?.longText
      const city =
        findType("locality") ||
        findType("postal_town") ||
        findType("administrative_area_level_3") ||
        place.displayName?.text ||
        "Unknown"
      const region = regionFromParts([
        findType("administrative_area_level_1"),
        findType("country"),
      ])

      return {
        id: `google_${place.id || placeId}`,
        city,
        region: region || place.formattedAddress || "—",
        label: place.formattedAddress || `${city}, ${region}`,
        lat,
        lon,
        timeZoneId: ianaFromCoords(lat, lon),
        provider: "google" as const,
      }
    }),
  )

  return details.filter(Boolean) as PlaceSearchResult[]
}

/** GeoNames city search — free/global, returns coordinates; IANA via geo-tz. */
async function searchGeoNames(query: string, username: string): Promise<PlaceSearchResult[]> {
  const url = new URL("http://api.geonames.org/searchJSON")
  url.searchParams.set("q", query)
  url.searchParams.set("maxRows", "8")
  url.searchParams.set("featureClass", "P")
  url.searchParams.set("orderby", "relevance")
  url.searchParams.set("username", username)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) {
    throw new Error(`GeoNames search failed (${res.status})`)
  }

  const json = (await res.json()) as {
    status?: { message?: string }
    geonames?: Array<{
      geonameId: number
      name: string
      countryName?: string
      adminName1?: string
      lat: string
      lng: string
      fcodeName?: string
    }>
  }

  if (json.status?.message) {
    throw new Error(`GeoNames: ${json.status.message}`)
  }

  return (json.geonames || []).map((g) => {
    const lat = Number(g.lat)
    const lon = Number(g.lng)
    const region = regionFromParts([g.adminName1, g.countryName])
    return {
      id: `geonames_${g.geonameId}`,
      city: g.name,
      region: region || "—",
      label: region ? `${g.name}, ${region}` : g.name,
      lat,
      lon,
      timeZoneId: ianaFromCoords(lat, lon),
      provider: "geonames" as const,
    }
  })
}

export type PlaceSearchMeta = {
  provider: "google" | "geonames" | "none"
  message?: string
}

/**
 * Search worldwide places.
 * Priority: Google Places (if GOOGLE_MAPS_API_KEY / GOOGLE_PLACES_API_KEY) → GeoNames (GEONAMES_USERNAME).
 */
export async function searchPlaces(query: string): Promise<{
  results: PlaceSearchResult[]
  meta: PlaceSearchMeta
}> {
  const q = query.trim()
  if (q.length < 2) {
    return { results: [], meta: { provider: "none" } }
  }

  const googleKey =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (googleKey) {
    try {
      const results = await searchGooglePlaces(q, googleKey)
      return { results, meta: { provider: "google" } }
    } catch (err) {
      console.error("[Places] Google failed, trying GeoNames:", err)
    }
  }

  const geoUser = process.env.GEONAMES_USERNAME
  if (geoUser) {
    const results = await searchGeoNames(q, geoUser)
    return { results, meta: { provider: "geonames" } }
  }

  return {
    results: [],
    meta: {
      provider: "none",
      message:
        "Configure GOOGLE_PLACES_API_KEY (recommended) or GEONAMES_USERNAME for worldwide place search.",
    },
  }
}

export function resolveTimeZoneId(lat: number, lon: number, fallback?: string): string {
  try {
    return ianaFromCoords(lat, lon)
  } catch {
    return fallback || "UTC"
  }
}
