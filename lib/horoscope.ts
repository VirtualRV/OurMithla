/**
 * Daily Vedic-style horoscope aligned with OurMithla Panchang (Lahiri / sidereal rashis).
 * Readings are deterministic per date + rashi so the same day always matches.
 */

export type RashiId =
  | "mesha"
  | "vrishabha"
  | "mithuna"
  | "karka"
  | "simha"
  | "kanya"
  | "tula"
  | "vrishchika"
  | "dhanu"
  | "makara"
  | "kumbha"
  | "meena"

export type Rashi = {
  id: RashiId
  name: string
  nameHi: string
  element: string
  lord: string
  symbol: string
}

export const RASHIS: Rashi[] = [
  { id: "mesha", name: "Mesha", nameHi: "मेष", element: "Fire", lord: "Mars", symbol: "♈" },
  { id: "vrishabha", name: "Vrishabha", nameHi: "वृषभ", element: "Earth", lord: "Venus", symbol: "♉" },
  { id: "mithuna", name: "Mithuna", nameHi: "मिथुन", element: "Air", lord: "Mercury", symbol: "♊" },
  { id: "karka", name: "Karka", nameHi: "कर्क", element: "Water", lord: "Moon", symbol: "♋" },
  { id: "simha", name: "Simha", nameHi: "सिंह", element: "Fire", lord: "Sun", symbol: "♌" },
  { id: "kanya", name: "Kanya", nameHi: "कन्या", element: "Earth", lord: "Mercury", symbol: "♍" },
  { id: "tula", name: "Tula", nameHi: "तुला", element: "Air", lord: "Venus", symbol: "♎" },
  { id: "vrishchika", name: "Vrishchika", nameHi: "वृश्चिक", element: "Water", lord: "Mars", symbol: "♏" },
  { id: "dhanu", name: "Dhanu", nameHi: "धनु", element: "Fire", lord: "Jupiter", symbol: "♐" },
  { id: "makara", name: "Makara", nameHi: "मकर", element: "Earth", lord: "Saturn", symbol: "♑" },
  { id: "kumbha", name: "Kumbha", nameHi: "कुम्भ", element: "Air", lord: "Saturn", symbol: "♒" },
  { id: "meena", name: "Meena", nameHi: "मीन", element: "Water", lord: "Jupiter", symbol: "♓" },
]

export type LifeArea = {
  key: "love" | "career" | "health" | "finance" | "spiritual"
  label: string
  labelHi: string
  score: number // 1–5
  advice: string
}

export type DailyHoroscope = {
  dateISO: string
  rashi: Rashi
  moonRashi: Rashi
  overview: string
  luckyColor: string
  luckyNumber: number
  luckyTime: string
  areas: LifeArea[]
  tip: string
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
  return arr[(seed + salt * 17) % arr.length]
}

function scoreFrom(seed: number, salt: number): number {
  return 2 + ((seed + salt * 31) % 4) // 2–5
}

const OVERVIEWS = [
  "Today favours steady effort over haste. Align your actions with dharma and the day's nakshatra energy.",
  "A calm, reflective pace serves you well. Listen more, speak with care, and honour family bonds.",
  "Creative sparks are strong — channel them into craft, study, or seva rather than scattered tasks.",
  "Relationships benefit from patience. Offer kindness first; clarity will follow.",
  "Practical decisions bring progress. Keep accounts clean and avoid unnecessary risk.",
  "Spiritual focus deepens. A short prayer or mantra can steady the mind before big choices.",
  "Travel or communication may open a door. Stay humble and verify details twice.",
  "Health and routine deserve attention. Simple food, rest, and early rising support your goals.",
]

const LOVE = [
  "Warmth grows through small gestures. Share time without expectation.",
  "Honest conversation clears old fog. Listen fully before you reply.",
  "Affection is present — express it gently and without pressure.",
  "Family harmony supports personal bonds. Avoid sharp words this evening.",
]

const CAREER = [
  "Focus on one meaningful task. Completion outshines new beginnings today.",
  "A mentor or elder's advice may prove useful — ask with respect.",
  "Teamwork elevates results. Credit others openly.",
  "Avoid impulsive commitments. Review terms before you sign or promise.",
]

const HEALTH = [
  "Hydration and light movement restore energy. Skip heavy late meals.",
  "Protect your eyes and rest if screens dominate the day.",
  "Breathing practice or a short walk resets stress quickly.",
  "Eat sattvic, warm food. Avoid excess spice and late caffeine.",
]

const FINANCE = [
  "Save before you spend. A small disciplined deposit strengthens security.",
  "Review recurring costs. One wise cut frees space for growth.",
  "Avoid speculative tips today. Stick to known, steady plans.",
  "Generosity is fine in measure — keep a clear record of gifts and loans.",
]

const SPIRITUAL = [
  "Light a diya or offer water with gratitude. Simple ritual steadies the day.",
  "Chant or sit in silence for a few minutes before dawn or dusk.",
  "Seva — helping someone quietly — multiplies auspiciousness.",
  "Read a verse or story from your tradition; let it guide one decision.",
]

const COLORS = ["Saffron", "Cream", "Vermilion", "Gold", "Indigo", "Forest Green", "Pearl White", "Terracotta"]
const TIMES = ["Brahma muhurat", "Morning after sunrise", "Mid-morning", "After noon prayer", "Evening sandhya", "Before moonrise"]

const TIPS = [
  "Begin the day with a short prayer facing east — it aligns intention with the rising sun.",
  "Offer a little water to a plant or tulsi; gratitude invites balance.",
  "Write one clear intention for the day and revisit it at dusk.",
  "Speak less about worries; act on the next kind step you can take.",
  "Keep your workspace tidy — outer order supports inner clarity.",
]

export function getRashiById(id: string): Rashi | undefined {
  return RASHIS.find((r) => r.id === id)
}

export function getRashiByIndex(index: number): Rashi {
  return RASHIS[((index % 12) + 12) % 12]
}

/** Sidereal moon rashi index from moon nirayana longitude (degrees). */
export function moonLongitudeToRashiIndex(moonNirayanaDeg: number): number {
  return Math.floor(((moonNirayanaDeg % 360) + 360) % 360 / 30) % 12
}

export function getDailyHoroscope(date: Date, rashiId: RashiId, moonRashiIndex: number): DailyHoroscope {
  const rashi = getRashiById(rashiId) ?? RASHIS[0]
  const moonRashi = getRashiByIndex(moonRashiIndex)
  const dateISO = date.toISOString().slice(0, 10)
  const seed = hashSeed(`${dateISO}:${rashi.id}`)

  const areas: LifeArea[] = [
    {
      key: "love",
      label: "Love & Relationships",
      labelHi: "प्रेम व संबंध",
      score: scoreFrom(seed, 1),
      advice: pick(LOVE, seed, 1),
    },
    {
      key: "career",
      label: "Career & Work",
      labelHi: "कर्म व व्यवसाय",
      score: scoreFrom(seed, 2),
      advice: pick(CAREER, seed, 2),
    },
    {
      key: "health",
      label: "Health & Energy",
      labelHi: "स्वास्थ्य",
      score: scoreFrom(seed, 3),
      advice: pick(HEALTH, seed, 3),
    },
    {
      key: "finance",
      label: "Wealth & Stability",
      labelHi: "धन व स्थिरता",
      score: scoreFrom(seed, 4),
      advice: pick(FINANCE, seed, 4),
    },
    {
      key: "spiritual",
      label: "Spiritual Growth",
      labelHi: "आध्यात्मिक विकास",
      score: scoreFrom(seed, 5),
      advice: pick(SPIRITUAL, seed, 5),
    },
  ]

  return {
    dateISO,
    rashi,
    moonRashi,
    overview: pick(OVERVIEWS, seed, 0),
    luckyColor: pick(COLORS, seed, 7),
    luckyNumber: 1 + (seed % 9),
    luckyTime: pick(TIMES, seed, 9),
    areas,
    tip: pick(TIPS, seed, 11),
  }
}
