/**
 * Classical-style shubh din scoring for Mithila / Hindu samskāras.
 * Advisory only — confirm with a qualified purohit for final muhurat.
 */

import { getPanchang, getMonthPatra, type Panchang } from "@/lib/panchang"

export type CeremonyId =
  | "vivah"
  | "janeu"
  | "mundan"
  | "namkaran"
  | "annaprashan"
  | "grihaPravesh"
  | "vehicle"
  | "general"

export type CeremonyInfo = {
  id: CeremonyId
  label: string
  labelHi: string
  labelMai: string
  description: string
}

export const CEREMONIES: CeremonyInfo[] = [
  {
    id: "vivah",
    label: "Marriage (Vivah)",
    labelHi: "विवाह",
    labelMai: "बियाह / विवाह",
    description: "Wedding / vivah muhurat — prefers shubh nakshatra & tithi; avoids Chaturmas where possible.",
  },
  {
    id: "janeu",
    label: "Janeu (Upanayana)",
    labelHi: "जनेऊ / उपनयन",
    labelMai: "जनेऊ संस्कार",
    description: "Sacred thread ceremony — classical list of nakshatras; better in bright fortnight.",
  },
  {
    id: "mundan",
    label: "Mundan (Muran)",
    labelHi: "मुंडन",
    labelMai: "मुरन / मुंडन",
    description: "First hair-cutting (chudakaran) — soft nakshatras; avoid Amavasya & Rikta tithis.",
  },
  {
    id: "namkaran",
    label: "Namkaran",
    labelHi: "नामकरण",
    labelMai: "नामकरण",
    description: "Naming ceremony — early months; prefer Shukla paksha and gentle days.",
  },
  {
    id: "annaprashan",
    label: "Annaprashan",
    labelHi: "अन्नप्राशन",
    labelMai: "अन्नप्राशन",
    description: "First rice feeding — Pushya and similar nourishing nakshatras favoured.",
  },
  {
    id: "grihaPravesh",
    label: "Griha Pravesh",
    labelHi: "गृह प्रवेश",
    labelMai: "घर प्रवेश",
    description: "New home entry — avoid Bhadra, Rikta, Amavasya; prefer stable nakshatras.",
  },
  {
    id: "vehicle",
    label: "Vehicle / Yatra",
    labelHi: "वाहन खरीद / यात्रा",
    labelMai: "गाडी / यात्रा",
    description: "Buying vehicle or starting travel — avoid Vishti (Bhadra) and empty tithis.",
  },
  {
    id: "general",
    label: "General Shubh Din",
    labelHi: "सामान्य शुभ दिन",
    labelMai: "सामान्य शुभ दिन",
    description: "Any new beginning — scored for overall panchang shuddhi.",
  },
]

const RIKTA = new Set(["Chaturthi", "Navami", "Chaturdashi"])

const BAD_YOGAS = new Set(["Atiganda", "Shula", "Ganda", "Vyatipata", "Vaidhriti", "Vyaghata", "Parigha"])

const VISHTI = /Vishti|Bhadra/i

const VIVAH_NAK = new Set([
  "Rohini",
  "Mrigashira",
  "Magha",
  "Uttara Phalguni",
  "Hasta",
  "Swati",
  "Anuradha",
  "Uttara Ashadha",
  "Uttara Bhadrapada",
  "Revati",
  "Mula",
])

const JANEU_NAK = new Set([
  "Ashwini",
  "Rohini",
  "Mrigashira",
  "Punarvasu",
  "Pushya",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Anuradha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Revati",
])

const MUNDAN_NAK = new Set([
  "Ashwini",
  "Rohini",
  "Mrigashira",
  "Punarvasu",
  "Pushya",
  "Hasta",
  "Chitra",
  "Swati",
  "Anuradha",
  "Shravana",
  "Dhanishta",
  "Revati",
])

const ANNAP_NAK = new Set([
  "Ashwini",
  "Rohini",
  "Punarvasu",
  "Pushya",
  "Hasta",
  "Shravana",
  "Dhanishta",
  "Revati",
])

const HOME_NAK = new Set([
  "Rohini",
  "Mrigashira",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Anuradha",
  "Uttara Ashadha",
  "Uttara Bhadrapada",
  "Revati",
])

const GOOD_TITHI_NAMES = new Set([
  "Dwitiya",
  "Tritiya",
  "Panchami",
  "Saptami",
  "Dashami",
  "Ekadashi",
  "Trayodashi",
])

const JANEU_BEST_TITHI = new Set(["Dwitiya", "Tritiya", "Panchami", "Dashami", "Saptami", "Trayodashi"])

export type DayScoreReason = { kind: "pro" | "con"; text: string }

export type AuspiciousDay = {
  date: Date
  dateLabel: string
  weekday: string
  score: number // 0–100
  grade: "excellent" | "good" | "fair" | "avoid"
  tithi: string
  paksha: string
  nakshatra: string
  yoga: string
  karana: string
  amanta: string
  purnimanta: string
  festivals: string[]
  reasons: DayScoreReason[]
  suggestedWindow: string
}

function tithiBaseName(p: Panchang): string {
  const v = p.tithi.value.split(" (")[0] || ""
  if (v.includes("Purnima")) return "Purnima"
  if (v.includes("Amavasya")) return "Amavasya"
  return v
}

function isChaturmas(p: Panchang): boolean {
  return p.vishnuStatus.isSleeping
}

function scoreDay(ceremony: CeremonyId, date: Date, locationId: string): AuspiciousDay {
  const p = getPanchang(date, locationId)
  const tithi = tithiBaseName(p)
  const nak = p.nakshatra.value
  const reasons: DayScoreReason[] = []
  let score = 55

  // Shared doshas
  if (tithi === "Amavasya") {
    score -= 35
    reasons.push({ kind: "con", text: "Amavasya — generally avoid for new beginnings" })
  }
  if (RIKTA.has(tithi)) {
    score -= 22
    reasons.push({ kind: "con", text: `${tithi} is Rikta (empty) tithi` })
  }
  if (VISHTI.test(p.karana.value)) {
    score -= 28
    reasons.push({ kind: "con", text: "Vishti / Bhadra karana — avoid starting ceremonies" })
  }
  if (BAD_YOGAS.has(p.yoga.value)) {
    score -= 12
    reasons.push({ kind: "con", text: `${p.yoga.value} yoga is traditionally harsh` })
  }
  if (GOOD_TITHI_NAMES.has(tithi)) {
    score += 12
    reasons.push({ kind: "pro", text: `${tithi} is a classical shubh tithi` })
  }
  if (p.paksha.startsWith("Shukla") && tithi !== "Purnima") {
    score += 6
    reasons.push({ kind: "pro", text: "Shukla paksha (waxing moon)" })
  }

  // Ceremony-specific
  switch (ceremony) {
    case "vivah": {
      if (isChaturmas(p)) {
        score -= 40
        reasons.push({ kind: "con", text: "Chaturmas / Vishnu in Yog Nidra — vivah usually deferred" })
      }
      if (VIVAH_NAK.has(nak)) {
        score += 22
        reasons.push({ kind: "pro", text: `${nak} is favourable for vivah` })
      } else {
        score -= 8
        reasons.push({ kind: "con", text: `${nak} is not among classical vivah nakshatras` })
      }
      if (tithi === "Purnima") {
        score -= 10
        reasons.push({ kind: "con", text: "Purnima — many families avoid vivah muhurat" })
      }
      break
    }
    case "janeu": {
      if (isChaturmas(p)) {
        score -= 25
        reasons.push({ kind: "con", text: "Chaturmas — janeu often avoided" })
      }
      if (JANEU_NAK.has(nak)) {
        score += 24
        reasons.push({ kind: "pro", text: `${nak} is classical for Upanayana / Janeu` })
      } else {
        score -= 10
        reasons.push({ kind: "con", text: `${nak} not preferred for Janeu` })
      }
      if (JANEU_BEST_TITHI.has(tithi)) {
        score += 10
        reasons.push({ kind: "pro", text: `${tithi} suits Janeu` })
      }
      if (p.paksha.startsWith("Krishna") && !["Dwitiya", "Tritiya", "Panchami"].includes(tithi)) {
        score -= 8
        reasons.push({ kind: "con", text: "Krishna paksha — limited tithis accepted for Janeu" })
      }
      if (tithi === "Purnima" || tithi === "Amavasya") {
        score -= 15
        reasons.push({ kind: "con", text: "Avoid Purnima / Amavasya for Janeu" })
      }
      break
    }
    case "mundan": {
      if (MUNDAN_NAK.has(nak)) {
        score += 22
        reasons.push({ kind: "pro", text: `${nak} is soft / suitable for Mundan (Muran)` })
      } else {
        score -= 6
      }
      if (tithi === "Purnima") {
        score += 4
        reasons.push({ kind: "pro", text: "Purnima acceptable for Mundan in many Mithila families" })
      }
      if (["Tuesday", "Saturday"].includes(p.vaar.value) && score > 40) {
        score -= 5
        reasons.push({ kind: "con", text: `${p.vaar.value} is less preferred for Mundan by some traditions` })
      }
      break
    }
    case "namkaran": {
      if (MUNDAN_NAK.has(nak) || ANNAP_NAK.has(nak)) {
        score += 18
        reasons.push({ kind: "pro", text: `${nak} suits Namkaran` })
      }
      if (p.paksha.startsWith("Shukla")) score += 5
      break
    }
    case "annaprashan": {
      if (ANNAP_NAK.has(nak)) {
        score += 24
        reasons.push({ kind: "pro", text: `${nak} is nourishing for Annaprashan` })
      }
      if (nak === "Pushya") {
        score += 8
        reasons.push({ kind: "pro", text: "Pushya is especially praised for feeding rites" })
      }
      break
    }
    case "grihaPravesh": {
      if (isChaturmas(p)) {
        score -= 30
        reasons.push({ kind: "con", text: "Chaturmas — griha pravesh usually deferred" })
      }
      if (HOME_NAK.has(nak)) {
        score += 22
        reasons.push({ kind: "pro", text: `${nak} supports stable griha pravesh` })
      }
      break
    }
    case "vehicle": {
      if (["Ashwini", "Rohini", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"].includes(nak)) {
        score += 18
        reasons.push({ kind: "pro", text: `${nak} is commonly used for vehicle / yatra` })
      }
      if (["Wednesday", "Thursday", "Friday"].includes(p.vaar.value)) {
        score += 6
        reasons.push({ kind: "pro", text: `${p.vaar.value} is favourable for travel / purchase` })
      }
      break
    }
    case "general":
    default: {
      if (JANEU_NAK.has(nak) || VIVAH_NAK.has(nak)) {
        score += 10
        reasons.push({ kind: "pro", text: `${nak} is generally auspicious` })
      }
      break
    }
  }

  if (p.festivals.length > 0 && !p.festivals.some((f) => /Amavasya|Pitru/i.test(f))) {
    score += 3
    reasons.push({ kind: "pro", text: `Festival note: ${p.festivals[0].replace(/^[^\p{L}\p{N}]+/u, "").slice(0, 60)}` })
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  let grade: AuspiciousDay["grade"] = "fair"
  if (score >= 78) grade = "excellent"
  else if (score >= 65) grade = "good"
  else if (score < 45) grade = "avoid"

  const windowHint =
    ceremony === "janeu"
      ? `Forenoon after sunrise (${p.sunrise}) preferred`
      : ceremony === "vivah"
        ? `Daytime muhurat between ${p.sunrise} – ${p.sunset}; confirm Lagna with purohit`
        : `Prefer Abhijit / Amrit windows near midday; sunrise ${p.sunrise}`

  return {
    date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    dateLabel: date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    weekday: p.vaar.value,
    score,
    grade,
    tithi: p.tithi.value,
    paksha: p.paksha,
    nakshatra: nak,
    yoga: p.yoga.value,
    karana: p.karana.value,
    amanta: p.amanta,
    purnimanta: p.purnimanta,
    festivals: p.festivals,
    reasons,
    suggestedWindow: windowHint,
  }
}

/** Rank days in a Gregorian month for a ceremony */
export function findAuspiciousDaysInMonth(
  year: number,
  month: number,
  locationId: string,
  ceremony: CeremonyId,
  options?: { minScore?: number; limit?: number },
): AuspiciousDay[] {
  const minScore = options?.minScore ?? 58
  const limit = options?.limit ?? 12
  const patra = getMonthPatra(year, month, locationId)

  const scored = patra.days
    .map((d) => scoreDay(ceremony, d.date, locationId))
    .sort((a, b) => b.score - a.score)

  const good = scored.filter((d) => d.score >= minScore && d.grade !== "avoid")
  return (good.length > 0 ? good : scored.filter((d) => d.grade !== "avoid")).slice(0, limit)
}

/** Quick map: date key → best ceremony grades for calendar badges */
export function monthCeremonyHighlights(
  year: number,
  month: number,
  locationId: string,
): Map<string, { ceremony: CeremonyId; score: number; grade: string }[]> {
  const map = new Map<string, { ceremony: CeremonyId; score: number; grade: string }[]>()
  const focus: CeremonyId[] = ["vivah", "janeu", "mundan", "namkaran", "annaprashan", "grihaPravesh"]
  const last = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= last; day++) {
    const d = new Date(year, month, day)
    const key = `${year}-${month}-${day}`
    const hits: { ceremony: CeremonyId; score: number; grade: string }[] = []
    for (const c of focus) {
      const s = scoreDay(c, d, locationId)
      if (s.score >= 68) hits.push({ ceremony: c, score: s.score, grade: s.grade })
    }
    if (hits.length) map.set(key, hits.sort((a, b) => b.score - a.score).slice(0, 3))
  }
  return map
}

export function getCeremony(id: CeremonyId): CeremonyInfo {
  return CEREMONIES.find((c) => c.id === id) ?? CEREMONIES[CEREMONIES.length - 1]
}
