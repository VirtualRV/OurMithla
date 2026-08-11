import "server-only"
import { RASHIS, type Rashi } from "@/lib/horoscope"
import type { BirthChart, BirthPlace, PlanetId, PlanetPlacement } from "@/lib/birth-chart-types"
import type { AstrologyProviderId } from "@/lib/astrology-providers/catalog"
import { getProviderInfo } from "@/lib/astrology-providers/catalog"

const PLANET_HI: Record<PlanetId, string> = {
  Sun: "सूर्य",
  Moon: "चंद्र",
  Mars: "मंगल",
  Mercury: "बुध",
  Jupiter: "गुरु",
  Venus: "शुक्र",
  Saturn: "शनि",
  Rahu: "राहु",
  Ketu: "केतु",
}

const NAME_MAP: Record<string, PlanetId> = {
  sun: "Sun",
  moon: "Moon",
  mars: "Mars",
  mercury: "Mercury",
  jupiter: "Jupiter",
  venus: "Venus",
  saturn: "Saturn",
  rahu: "Rahu",
  ketu: "Ketu",
  "true node": "Rahu",
  "mean node": "Rahu",
}

export function rashiFromNameOrIndex(input: string | number | undefined | null): Rashi {
  if (typeof input === "number" && Number.isFinite(input)) {
    return RASHIS[((Math.floor(input) % 12) + 12) % 12]
  }
  const s = String(input || "")
    .toLowerCase()
    .trim()
  const byId = RASHIS.find((r) => r.id === s || r.name.toLowerCase() === s)
  if (byId) return byId
  // common API aliases
  const aliases: Record<string, string> = {
    aries: "mesha",
    taurus: "vrishabha",
    gemini: "mithuna",
    cancer: "karka",
    leo: "simha",
    virgo: "kanya",
    libra: "tula",
    scorpio: "vrishchika",
    sagittarius: "dhanu",
    capricorn: "makara",
    aquarius: "kumbha",
    pisces: "meena",
  }
  const mapped = aliases[s]
  return RASHIS.find((r) => r.id === mapped) ?? RASHIS[0]
}

export function mapPlanetId(name: string): PlanetId | null {
  const key = name.toLowerCase().trim()
  if (key.includes("asc") || key.includes("lagna")) return null
  return NAME_MAP[key] ?? null
}

export function buildSkeletonChart(args: {
  provider: AstrologyProviderId
  name: string
  birthDate: string
  birthTime: string
  place: BirthPlace
  lagna: Rashi
  lagnaDegree?: number
  sunRashi: Rashi
  moonRashi: Rashi
  nakshatra?: string
  nakshatraPada?: number
  moonDegree?: number
  ayanamsha?: number
  planets: PlanetPlacement[]
  overview?: string
  utcISO?: string
  jdUt?: number
}): BirthChart {
  const info = getProviderInfo(args.provider)
  const houses = Array.from({ length: 12 }, (_, i) => {
    const rashi = RASHIS[(RASHIS.findIndex((r) => r.id === args.lagna.id) + i) % 12]
    const number = i + 1
    return {
      number,
      rashi,
      lord: rashi.lord,
      themes: "",
      planets: args.planets.filter((p) => p.house === number).map((p) => p.id),
    }
  })

  const engine =
    args.provider === "swiss"
      ? ("swiss-ephemeris-lahiri" as const)
      : args.provider

  return {
    name: args.name,
    birthDate: args.birthDate,
    birthTime: args.birthTime,
    place: args.place,
    utcISO: args.utcISO || "",
    jdUt: args.jdUt || 0,
    ayanamsha: args.ayanamsha ?? 0,
    engine,
    houseSystem: args.provider === "swiss" ? "whole-sign" : "provider",
    lagna: args.lagna,
    lagnaDegree: args.lagnaDegree ?? 0,
    sunRashi: args.sunRashi,
    moonRashi: args.moonRashi,
    nakshatra: args.nakshatra || "—",
    nakshatraPada: args.nakshatraPada || 1,
    moonDegree: args.moonDegree ?? 0,
    planets: args.planets,
    houses,
    overview:
      args.overview ||
      `Chart generated via ${info.label}. Compare providers to see differences in Lagna, planets, and nakshatra.`,
    predictions: [],
    remedies: [
      "Compare this chart with Swiss Ephemeris (local) for a second opinion on Lagna and Moon nakshatra.",
      "For marriage matching, dasha timing, or muhurat, use a qualified jyotishi — APIs differ slightly by ayanāṃśa and house system.",
    ],
    disclaimer: `Source: ${info.label}. Upstream astrology APIs may use their own house systems and ephemeris settings. For ritual muhurat, consult a qualified jyotishi.`,
    provider: args.provider,
    providerLabel: info.label,
  }
}

export function planetPlacement(partial: {
  id: PlanetId
  longitude?: number
  rashi: Rashi
  degreeInRashi?: number
  house?: number
  dignity?: string
  retrograde?: boolean
}): PlanetPlacement {
  return {
    id: partial.id,
    nameHi: PLANET_HI[partial.id],
    longitude: partial.longitude ?? 0,
    rashi: partial.rashi,
    degreeInRashi: partial.degreeInRashi ?? 0,
    house: partial.house ?? 1,
    dignity: partial.dignity || "—",
    retrograde: partial.retrograde,
  }
}
