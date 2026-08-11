/**
 * Janam Kundli engine — production-grade calculation path:
 * 1) Birth local time + IANA timezone → UTC (Luxon, DST-aware)
 * 2) Swiss Ephemeris planetary positions
 * 3) Sidereal + Lahiri (Chitrapaksha) ayanāṃśa
 * 4) Whole-sign houses from sidereal Lagna
 */

import "server-only"
import { DateTime } from "luxon"
import { RASHIS, type Rashi, type RashiId } from "@/lib/horoscope"
import { computeSwissLahiriChart } from "@/lib/swiss-ephemeris"
import { resolveTimeZoneId } from "@/lib/places"
import {
  BIRTH_PLACE_PRESETS,
  type BirthPlace,
  type PlanetId,
  type PlanetPlacement,
  type HouseInfo,
  type LifePrediction,
  type BirthChart,
} from "@/lib/birth-chart-types"

export type {
  BirthPlace,
  PlanetId,
  PlanetPlacement,
  HouseInfo,
  LifePrediction,
  BirthChart,
}
export { BIRTH_PLACE_PRESETS, BIRTH_PLACE_PRESETS as BIRTH_PLACES }

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
]

const HOUSE_THEMES = [
  "Self, body, vitality, beginnings",
  "Wealth, speech, family values",
  "Courage, siblings, short travel, skills",
  "Home, mother, peace of mind, property",
  "Creativity, children, romance, intelligence",
  "Health, service, competition, daily work",
  "Partnership, marriage, contracts",
  "Transformation, longevity, shared resources",
  "Fortune, dharma, higher learning, father",
  "Career, status, public life, ambition",
  "Gains, networks, aspirations, elder siblings",
  "Expenses, liberation, foreign lands, spirituality",
]

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

function norm360(x: number): number {
  return ((x % 360) + 360) % 360
}

function rashiFromLong(longDeg: number): Rashi {
  return RASHIS[Math.floor(norm360(longDeg) / 30) % 12]
}

function degInRashi(longDeg: number): number {
  return +(norm360(longDeg) % 30).toFixed(4)
}

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pick<T>(arr: T[], seed: number, salt: number): T {
  return arr[(seed + salt * 19) % arr.length]
}

function score(seed: number, salt: number): number {
  return 2 + ((seed + salt * 29) % 4)
}

function houseFromLagna(planetLong: number, lagnaLong: number): number {
  const lagnaSignStart = Math.floor(norm360(lagnaLong) / 30) * 30
  const diff = norm360(planetLong - lagnaSignStart)
  return (Math.floor(diff / 30) % 12) + 1
}

function dignityFor(planet: PlanetId, rashiId: RashiId): string {
  const exalt: Partial<Record<PlanetId, RashiId>> = {
    Sun: "mesha",
    Moon: "vrishabha",
    Mars: "makara",
    Mercury: "kanya",
    Jupiter: "karka",
    Venus: "meena",
    Saturn: "tula",
  }
  const own: Partial<Record<PlanetId, RashiId[]>> = {
    Sun: ["simha"],
    Moon: ["karka"],
    Mars: ["mesha", "vrishchika"],
    Mercury: ["mithuna", "kanya"],
    Jupiter: ["dhanu", "meena"],
    Venus: ["vrishabha", "tula"],
    Saturn: ["makara", "kumbha"],
  }
  if (exalt[planet] === rashiId) return "Exalted"
  if (own[planet]?.includes(rashiId)) return "Own sign"
  if (planet === "Rahu" || planet === "Ketu") return "Shadow node"
  return "Neutral"
}

function buildOverview(lagna: Rashi, moon: Rashi, sun: Rashi, seed: number): string {
  return [
    `With ${lagna.name} Lagna, your outer path leans toward ${lagna.element.toLowerCase()} strength and the guidance of ${lagna.lord}.`,
    `Moon in ${moon.name} shapes your emotional nature — ${moon.element.toLowerCase()} sensitivity with ${moon.lord}'s influence.`,
    `Sun in ${sun.name} colours purpose and vitality.`,
    pick(
      [
        "Steady dharma, sincere effort, and respect for elders unlock your best chapters.",
        "Creative work and community seva bring lasting fulfilment beyond short gains.",
        "Balance ambition with rest — your chart favours endurance over haste.",
        "Learning and teaching roles suit you; share knowledge with humility.",
      ],
      seed,
      3,
    ),
  ].join(" ")
}

function buildPredictions(
  lagna: Rashi,
  moon: Rashi,
  sun: Rashi,
  planets: PlanetPlacement[],
  seed: number,
): LifePrediction[] {
  const jupiterHouse = planets.find((p) => p.id === "Jupiter")?.house ?? 9
  const saturnHouse = planets.find((p) => p.id === "Saturn")?.house ?? 10
  const venusHouse = planets.find((p) => p.id === "Venus")?.house ?? 7
  const marsHouse = planets.find((p) => p.id === "Mars")?.house ?? 1

  return [
    {
      key: "personality",
      title: "Personality & Nature",
      titleHi: "स्वभाव",
      summary: `Lagna ${lagna.name} with Moon in ${moon.name} gives a ${lagna.element.toLowerCase()}-${moon.element.toLowerCase()} blend.`,
      strengths: [
        `${lagna.lord}-ruled drive helps you start boldly`,
        `Empathy and intuition from ${moon.name} Moon`,
        pick(["Natural leadership in small groups", "Calm presence in family matters", "Creative problem-solving"], seed, 1),
      ],
      watchouts: [
        pick(["Avoid impulsive speech when emotions rise", "Don't scatter energy across too many plans", "Guard against overthinking at night"], seed, 2),
      ],
      score: score(seed, 1),
    },
    {
      key: "career",
      title: "Career & Purpose",
      titleHi: "कर्म व उद्देश्य",
      summary: `Sun in ${sun.name} and Saturn from house ${saturnHouse} favour patient, responsible work.`,
      strengths: [
        pick(["Teaching, advisory, or cultural work", "Administration and organised service", "Creative or craft-based livelihood", "Tech with a human/community angle"], seed, 4),
        `Jupiter in house ${jupiterHouse} supports growth through learning`,
      ],
      watchouts: [
        "Avoid job-hopping without a clear dharma reason",
        pick(["Document agreements carefully", "Don't ignore mentors' caution"], seed, 5),
      ],
      score: score(seed, 2),
    },
    {
      key: "wealth",
      title: "Wealth & Stability",
      titleHi: "धन व स्थिरता",
      summary: "Wealth grows through discipline, ethical earning, and long-term saving rather than speculation.",
      strengths: [
        pick(["Skill-based income compounds well", "Property and family assets can stabilise you", "Partnerships bring gain if trust is strong"], seed, 6),
      ],
      watchouts: [
        "Avoid lending large sums without clarity",
        pick(["Limit speculative tips", "Keep an emergency reserve sacred"], seed, 7),
      ],
      score: score(seed, 3),
    },
    {
      key: "relationships",
      title: "Love & Relationships",
      titleHi: "प्रेम व संबंध",
      summary: `Venus in house ${venusHouse} colours bonding — affection deepens with respect and shared values.`,
      strengths: [
        pick(["Loyal once trust is earned", "Warm host and caring partner", "Attracted to cultured, sincere people"], seed, 8),
      ],
      watchouts: [
        pick(["Don't silence your needs to keep peace", "Choose partnership over possession"], seed, 9),
      ],
      score: score(seed, 4),
    },
    {
      key: "health",
      title: "Health & Vitality",
      titleHi: "स्वास्थ्य",
      summary: `Mars in house ${marsHouse} fuels energy; balance activity with restorative routines.`,
      strengths: [
        pick(["Strong recovery when you sleep early", "Benefits from yoga, walking, and sattvic food"], seed, 10),
      ],
      watchouts: [
        pick(["Watch stress in the gut and sleep cycle", "Avoid anger-driven overexertion"], seed, 11),
      ],
      score: score(seed, 5),
    },
    {
      key: "family",
      title: "Family & Home",
      titleHi: "परिवार",
      summary: "Home thrives when rituals, shared meals, and honest conversation stay simple and regular.",
      strengths: [
        pick(["You can be a bridge between generations", "Hospitality is a natural gift"], seed, 12),
      ],
      watchouts: ["Don't carry every family burden alone"],
      score: score(seed, 6),
    },
    {
      key: "spiritual",
      title: "Spiritual Path",
      titleHi: "आध्यात्मिक पथ",
      summary: "Your chart responds well to mantra, seva, and quiet dawn practice.",
      strengths: [
        pick(["Devotion through song, art, or study", "Pilgrimage and sacred places recharge you"], seed, 13),
      ],
      watchouts: ["Avoid spiritual ego or comparison"],
      score: score(seed, 7),
    },
    {
      key: "timing",
      title: "Life Timing Themes",
      titleHi: "समय व चरण",
      summary: "Major growth often arrives after patient preparation — learning, relocation, or responsibility upgrades.",
      strengths: [
        pick(["Mid-life chapters favour mastery and mentoring", "Early effort in skills pays later dividends"], seed, 14),
      ],
      watchouts: ["Don't force outcomes in restless months — refine the plan instead"],
      score: score(seed, 8),
    },
  ]
}

function buildRemedies(lagna: Rashi, moon: Rashi, seed: number): string[] {
  return [
    `Offer water or light a diya on ${lagna.lord}'s day to honour your Lagna lord.`,
    pick(
      [
        "Chant a short mantra for your Moon rashi after sunset for emotional balance.",
        "Keep a small tulsi or peepal seva habit weekly.",
        "Donate food on Saturdays if Saturn feels heavy in life.",
      ],
      seed,
      15,
    ),
    `Wear or keep near colours that soothe ${moon.name} Moon — cream, soft saffron, or muted earth tones.`,
    "Begin important work after a calm breath and a clear intention.",
  ]
}

export type BirthChartInput = {
  name: string
  birthDate: string // YYYY-MM-DD
  birthTime: string // HH:mm
  placeId?: string
  place?: BirthPlace
}

/** Convert civil birth date/time in an IANA zone to a precise UTC Date. */
export function birthLocalToUtc(
  birthDate: string,
  birthTime: string,
  timeZoneId: string,
): { utc: Date; offsetMinutes: number; utcISO: string } {
  const [y, m, d] = birthDate.split("-").map(Number)
  const [hh, mm] = birthTime.split(":").map(Number)

  const local = DateTime.fromObject(
    {
      year: y,
      month: m,
      day: d,
      hour: hh || 0,
      minute: mm || 0,
      second: 0,
    },
    { zone: timeZoneId },
  )

  if (!local.isValid) {
    throw new Error(`Invalid birth date/time for zone ${timeZoneId}: ${local.invalidReason}`)
  }

  const utc = local.toUTC()
  return {
    utc: utc.toJSDate(),
    offsetMinutes: local.offset,
    utcISO: utc.toISO() || utc.toISO()!,
  }
}

export function normalizeBirthPlace(input?: BirthPlace, placeId?: string): BirthPlace {
  if (input && Number.isFinite(input.lat) && Number.isFinite(input.lon)) {
    const timeZoneId =
      input.timeZoneId && input.timeZoneId.trim()
        ? input.timeZoneId.trim()
        : resolveTimeZoneId(input.lat, input.lon, "UTC")
    return {
      id: input.id || `custom_${input.lat}_${input.lon}`,
      city: input.city || "Custom",
      region: input.region || "—",
      lat: input.lat,
      lon: input.lon,
      timeZoneId,
    }
  }

  const preset = BIRTH_PLACE_PRESETS.find((p) => p.id === placeId) ?? BIRTH_PLACE_PRESETS[0]
  return { ...preset }
}

export function generateBirthChart(input: BirthChartInput): BirthChart {
  const place = normalizeBirthPlace(input.place, input.placeId)
  const { utc, offsetMinutes, utcISO } = birthLocalToUtc(
    input.birthDate,
    input.birthTime,
    place.timeZoneId,
  )

  const core = computeSwissLahiriChart(utc, place.lat, place.lon)
  const lagna = rashiFromLong(core.lagnaLongitude)

  const order: PlanetId[] = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
    "Rahu",
    "Ketu",
  ]

  const planets: PlanetPlacement[] = order.map((id) => {
    const raw = core.planets.find((p) => p.id === id)!
    const rashi = rashiFromLong(raw.longitude)
    return {
      id,
      nameHi: PLANET_HI[id],
      longitude: +raw.longitude.toFixed(4),
      rashi,
      degreeInRashi: degInRashi(raw.longitude),
      house: houseFromLagna(raw.longitude, core.lagnaLongitude),
      dignity: dignityFor(id, rashi.id),
      retrograde: raw.retrograde,
    }
  })

  const lagnaSignIndex = Math.floor(norm360(core.lagnaLongitude) / 30) % 12
  const houses: HouseInfo[] = Array.from({ length: 12 }, (_, i) => {
    const rashi = RASHIS[(lagnaSignIndex + i) % 12]
    const number = i + 1
    return {
      number,
      rashi,
      lord: rashi.lord,
      themes: HOUSE_THEMES[i],
      planets: planets.filter((p) => p.house === number).map((p) => p.id),
    }
  })

  const sunRashi = planets.find((p) => p.id === "Sun")!.rashi
  const moonPlanet = planets.find((p) => p.id === "Moon")!
  const moonRashi = moonPlanet.rashi
  const moonLong = moonPlanet.longitude
  const nakIndex = Math.floor(norm360(moonLong) / (360 / 27)) % 27
  const nakPada = (Math.floor((norm360(moonLong) % (360 / 27)) / (360 / 27 / 4)) % 4) + 1

  const name = input.name.trim() || "Seeker"
  const seed = hashSeed(
    `${name}|${input.birthDate}|${input.birthTime}|${place.timeZoneId}|${place.lat}|${place.lon}|${core.lagnaLongitude.toFixed(4)}`,
  )

  return {
    name,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    place: {
      ...place,
      tzOffsetHours: offsetMinutes / 60,
    },
    utcISO,
    jdUt: core.jdUt,
    ayanamsha: +core.ayanamsha.toFixed(6),
    engine: "swiss-ephemeris-lahiri",
    houseSystem: "whole-sign",
    lagna,
    lagnaDegree: +degInRashi(core.lagnaLongitude).toFixed(4),
    sunRashi,
    moonRashi,
    nakshatra: NAKSHATRAS[nakIndex],
    nakshatraPada: nakPada,
    moonDegree: +moonLong.toFixed(4),
    planets,
    houses,
    overview: buildOverview(lagna, moonRashi, sunRashi, seed),
    predictions: buildPredictions(lagna, moonRashi, sunRashi, planets, seed),
    remedies: buildRemedies(lagna, moonRashi, seed),
    disclaimer:
      "Chart calculated with Swiss Ephemeris (sidereal, Lahiri/Chitrapaksha ayanāṃśa) and IANA timezone conversion (DST-aware). Life narratives are interpretive guidance. For muhurat, marriage matching, or medical astrology, consult a qualified jyotishi. Swiss Ephemeris licensing: review Astrodienst terms for commercial use.",
    provider: "swiss",
    providerLabel: "Swiss Ephemeris (Local)",
  }
}
