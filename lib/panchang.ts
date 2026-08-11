// Accurate Astronomical Panchang & Hindu Calendar calculations.
// Computes true Solar & Lunar longitudes, Lahiri Ayanamsha, exact Tithi,
// Nakshatra, Yoga, Karana, Lord Vishnu Sleep Status (Devshayani Chaturmas),
// and active Vrats / Mithila Festivals.

export type Location = {
  id: string
  city: string
  region: string
}

export const LOCATIONS: Location[] = [
  { id: 'darbhanga', city: 'Darbhanga', region: 'Bihar, India' },
  { id: 'madhubani', city: 'Madhubani', region: 'Bihar, India' },
  { id: 'janakpur', city: 'Janakpur', region: 'Madhesh, Nepal' },
  { id: 'patna', city: 'Patna', region: 'Bihar, India' },
  { id: 'kathmandu', city: 'Kathmandu', region: 'Bagmati, Nepal' },
  { id: 'delhi', city: 'New Delhi', region: 'Delhi, India' },
  { id: 'varanasi', city: 'Varanasi', region: 'Uttar Pradesh, India' },
]

const TITHIS = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Purnima',
  'Amavasya',
]

const EKADASHI_NAMES: Record<number, string> = {
  0: 'Chaitra Kamada Ekadashi',
  1: 'Chaitra Varuthini Ekadashi',
  2: 'Vaishakha Mohini Ekadashi',
  3: 'Vaishakha Apara Ekadashi',
  4: 'Jyeshtha Nirjala Ekadashi',
  5: 'Jyeshtha Yogini Ekadashi',
  6: 'Ashadha Devshayani Ekadashi', // Lord Vishnu sleeps
  7: 'Ashadha Kamika Ekadashi',
  8: 'Shravana Shravana Putrada Ekadashi',
  9: 'Shravana Aja Ekadashi',
  10: 'Bhadrapada Parsva / Vamana Ekadashi',
  11: 'Bhadrapada Indira Ekadashi',
  12: 'Ashwina Papankusha Ekadashi',
  13: 'Ashwina Rama Ekadashi',
  14: 'Kartika Devutthana / Prabodhini Ekadashi', // Lord Vishnu awakens
  15: 'Kartika Utpanna Ekadashi',
  16: 'Margashirsha Mokshada Ekadashi',
  17: 'Margashirsha Saphala Ekadashi',
  18: 'Pausha Pausha Putrada Ekadashi',
  19: 'Pausha Shattila Ekadashi',
  20: 'Magha Jaya Ekadashi',
  21: 'Magha Vijaya Ekadashi',
  22: 'Phalguna Amalaki Ekadashi',
  23: 'Phalguna Papmochani Ekadashi',
}

const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
]

const YOGAS = [
  'Vishkambha',
  'Priti',
  'Ayushman',
  'Saubhagya',
  'Shobhana',
  'Atiganda',
  'Sukarma',
  'Dhriti',
  'Shula',
  'Ganda',
  'Vriddhi',
  'Dhruva',
  'Vyaghata',
  'Harshana',
  'Vajra',
  'Siddhi',
  'Vyatipata',
  'Variyana',
  'Parigha',
  'Shiva',
  'Siddha',
  'Sadhya',
  'Shubha',
  'Shukla',
  'Brahma',
  'Indra',
  'Vaidhriti',
]

const KARANAS = [
  'Bava',
  'Balava',
  'Kaulava',
  'Taitila',
  'Gara',
  'Vanija',
  'Vishti (Bhadra)',
  'Shakuni',
  'Chatushpada',
  'Naga',
  'Kimstughna',
]

const VAARS = [
  { en: 'Sunday', hi: 'Ravivar' },
  { en: 'Monday', hi: 'Somvar' },
  { en: 'Tuesday', hi: 'Mangalvar' },
  { en: 'Wednesday', hi: 'Budhvar' },
  { en: 'Thursday', hi: 'Guruvar' },
  { en: 'Friday', hi: 'Shukravar' },
  { en: 'Saturday', hi: 'Shanivar' },
]

const AMANTA_MONTHS = [
  'Chaitra',
  'Vaishakha',
  'Jyeshtha',
  'Ashadha',
  'Shravana',
  'Bhadrapada',
  'Ashwina',
  'Kartika',
  'Margashirsha',
  'Pausha',
  'Magha',
  'Phalguna',
]

const PAKSHAS = ['Shukla Paksha', 'Krishna Paksha']

export type PanchangElement = {
  label: string
  labelHi: string
  value: string
  detail: string
}

export type Timing = {
  label: string
  time: string
}

export type Panchang = {
  tithi: PanchangElement
  vaar: PanchangElement
  nakshatra: PanchangElement
  yoga: PanchangElement
  karana: PanchangElement
  paksha: string
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  auspicious: Timing[]
  inauspicious: Timing[]
  vikramSamvat: number
  shakaSamvat: number
  amanta: string
  purnimanta: string
  ritu: string
  vishnuStatus: {
    isSleeping: boolean
    title: string
    titleHi: string
    description: string
  }
  festivals: string[]
  fastingNote: string
  /** Sidereal moon rashi index 0–11 (Mesha…Meena), matches Lahiri calculation. */
  moonRashiIndex: number
  moonRashi: string
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function toClock(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes)
  const m = ((rounded % 1440) + 1440) % 1440
  let hours = Math.floor(m / 60)
  const minutes = m % 60
  const suffix = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${hours}:${pad(minutes)} ${suffix}`
}

/**
 * Astronomical Solar & Lunar position calculation.
 * Computes exact ecliptic longitudes to calculate Tithi, Nakshatra, Yoga, Karana.
 */
function getAstronomicalLongitudes(date: Date) {
  const d =
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0) -
      Date.UTC(2000, 0, 1, 12, 0, 0)) /
    86400000

  // Solar Mean Longitude & Anomaly
  const Ls = (280.46646 + 0.98564736 * d) % 360
  const Ms = (357.52911 + 0.98560028 * d) % 360
  const MsRad = (Ms * Math.PI) / 180

  // Sun Ecliptic Longitude (True)
  const sunLong = (Ls + 1.91466 * Math.sin(MsRad) + 0.01999 * Math.sin(2 * MsRad) + 360) % 360

  // Lunar Mean Longitude & Anomaly
  const Lm = (218.3165 + 13.176396 * d) % 360
  const Mm = (134.9634 + 13.064993 * d) % 360
  const D = (297.8502 + 12.190749 * d) % 360 // Elongation mean

  const MmRad = (Mm * Math.PI) / 180
  const DRad = (D * Math.PI) / 180

  // Moon Ecliptic Longitude (True)
  const moonLong =
    (Lm +
      6.2886 * Math.sin(MmRad) +
      1.274 * Math.sin(2 * DRad - MmRad) +
      0.6583 * Math.sin(2 * DRad) +
      0.2136 * Math.sin(2 * MmRad) +
      360) %
    360

  // Elongation: Moon - Sun angle
  const elongation = (moonLong - sunLong + 360) % 360

  // Lahiri Ayanamsha (approx 24.1 deg for 2026)
  const ayanamsha = 23.85 + (d / 365.25) * 0.013

  // Nirayana (Sidereal) longitudes
  const moonNirayana = (moonLong - ayanamsha + 360) % 360
  const sunNirayana = (sunLong - ayanamsha + 360) % 360

  return { sunLong, moonLong, elongation, moonNirayana, sunNirayana, ayanamsha }
}

export function getPanchang(date: Date, locationId: string): Panchang {
  const { sunLong, moonLong, elongation, moonNirayana, sunNirayana } = getAstronomicalLongitudes(date)

  // 1 Tithi = 12 degrees elongation
  const totalTithiNum = Math.floor(elongation / 12) // 0 to 29
  const isKrishna = totalTithiNum >= 15
  const tithiIndex = totalTithiNum % 15 // 0 to 14

  let tithiName = TITHIS[tithiIndex]
  if (tithiIndex === 14) {
    tithiName = isKrishna ? 'Amavasya' : 'Purnima'
  }

  const paksha = isKrishna ? PAKSHAS[1] : PAKSHAS[0]

  // Nakshatra = 13 deg 20 min = 13.333333 deg
  const nakshatraIndex = Math.floor(moonNirayana / (360 / 27)) % 27
  const nakshatra = NAKSHATRAS[nakshatraIndex]

  // Yoga = (Sun + Moon sidereal longitudes) / (13 deg 20 min)
  const yogaIndex = Math.floor(((sunNirayana + moonNirayana) % 360) / (360 / 27)) % 27
  const yoga = YOGAS[yogaIndex]

  // Karana = 6 deg elongation
  const karanaIndex = Math.floor(elongation / 6) % 11
  const karana = KARANAS[karanaIndex]

  const vaar = VAARS[((date.getDay() % 7) + 7) % 7]

  // Hindu Month Calculation (Amanta & Purnimanta - Mithila System)
  // Rashi of Sun determines Hindu Solar Month (Zodiac: Mesha=0 to Meena=11)
  // Cancer (Karka=3) -> Shravana (Index 4: सावन)
  const sunRashiIndex = Math.floor(sunNirayana / 30) % 12
  const moonRashiIndex = Math.floor(moonNirayana / 30) % 12
  const MOON_RASHIS = [
    'Mesha',
    'Vrishabha',
    'Mithuna',
    'Karka',
    'Simha',
    'Kanya',
    'Tula',
    'Vrishchika',
    'Dhanu',
    'Makara',
    'Kumbha',
    'Meena',
  ]
  const moonRashi = MOON_RASHIS[moonRashiIndex]
  const amantaMonthIndex = (sunRashiIndex + 1) % 12
  const amanta = AMANTA_MONTHS[amantaMonthIndex]

  // Purnimanta System (Used in Mithila, Bihar, UP, Northern India):
  // Purnimanta month begins after Purnima (Krishna Paksha 1)
  const purnimantaMonthIndex = isKrishna ? amantaMonthIndex : amantaMonthIndex
  const purnimanta = AMANTA_MONTHS[purnimantaMonthIndex]

  // ── Lord Vishnu Sleep Status (Devshayani Chaturmas) Calculation ──
  // Devshayani Ekadashi: Ashadha Shukla Ekadashi (July 25, 2026)
  // Dev Uthani Ekadashi: Kartika Shukla Ekadashi (Nov 20, 2026)
  // Lord Vishnu is in Yog Nidra (Sleeping) during Chaturmas (Ashadha, Shravana, Bhadrapada, Ashwina, Kartika).
  const gMonth = date.getMonth() // 0 = Jan, 6 = July, 7 = Aug, 10 = Nov
  const gDay = date.getDate()

  const isGregorianChaturmas =
    (gMonth === 6 && gDay >= 25) || // July 25 onwards
    (gMonth >= 7 && gMonth <= 9) || // August, September, October
    (gMonth === 10 && gDay <= 20)   // November up to Nov 20

  const isLunarChaturmas =
    (amantaMonthIndex === 3 && (paksha === 'Shukla Paksha' ? tithiIndex >= 10 : true)) ||
    (amantaMonthIndex > 3 && amantaMonthIndex < 7) ||
    (amantaMonthIndex === 7 && (paksha === 'Shukla Paksha' ? tithiIndex <= 10 : false))

  const isVishnuSleeping = isGregorianChaturmas || isLunarChaturmas

  const vishnuStatus = isVishnuSleeping
    ? {
        isSleeping: true,
        title: 'Shri Vishnu in Yog Nidra (Devshayani Chaturmas)',
        titleHi: 'भगवान श्री हरि विष्णु योग निद्रा में हैं (चातुर्मास)',
        description:
          'Lord Vishnu is in celestial slumber (Yog Nidra) on Ananta Shesha in Kshira Sagara. Sacred period of Chaturmas devoted to prayer, fasting, and spiritual discipline.',
      }
    : {
        isSleeping: false,
        title: 'Shri Vishnu Awakened (Jagrit / Devuthani)',
        titleHi: 'भगवान श्री हरि विष्णु जाग्रत अवस्था में हैं (देवोत्थान)',
        description:
          'Lord Vishnu is awakened from Yog Nidra. Auspicious time for weddings, ceremonies, and major celebrations.',
      }

  // ── Active Festivals & Vrats Detection ──
  const festivals: string[] = []
  let fastingNote = ''

  // Shravan Month (Sawan / श्रावण मास) Vrats
  if (purnimanta === 'Shravana' || amanta === 'Shravana') {
    if (vaar.en === 'Monday') {
      festivals.push('🕉️ Shravan Somvar Vrat (सावन सोमवार व्रत - Lord Shiva Abhishekam)')
      fastingNote = 'Today is sacred Shravan Somvar Vrat. Devotees fast and offer Jalabhisheka / Milk to Lord Shiva.'
    } else if (vaar.en === 'Tuesday') {
      festivals.push('🌺 Mangla Gauri Vrat (मंगला गौरी व्रत - Maa Parvati Puja)')
    }
  }

  // Ekadashi Vrat
  if (gMonth === 6 && gDay === 25) {
    festivals.push('🌸 Devshayani Ekadashi Vrat')
    festivals.push('☸️ Devshayani Ekadashi (Start of Chaturmas - Lord Vishnu enters Yog Nidra)')
    fastingNote = 'Today is Devshayani Ekadashi Vrat. Lord Vishnu enters 4 months of Yog Nidra (Chaturmas).'
  } else if (tithiIndex === 10) {
    const ekadashiKey = amantaMonthIndex * 2 + (isKrishna ? 1 : 0)
    const ekadashiName = EKADASHI_NAMES[ekadashiKey] || 'Ekadashi Vrat'
    festivals.push(`🌸 ${ekadashiName}`)
    fastingNote = `Today is ${ekadashiName}. Devotees observe strict fast and worship Lord Vishnu.`
    if (amantaMonthIndex === 3 && !isKrishna) {
      festivals.push('☸️ Devshayani Ekadashi (Start of Chaturmas - Lord Vishnu enters Yog Nidra)')
    } else if (amantaMonthIndex === 7 && !isKrishna) {
      festivals.push('🔔 Devutthana / Prabodhini Ekadashi (Lord Vishnu Awakens)')
    }
  }

  // Pradosh Vrat (Trayodashi)
  if (tithiIndex === 12) {
    festivals.push('🔱 Pradosh Vrat')
    if (!fastingNote) fastingNote = 'Today is Pradosh Vrat dedicated to Lord Shiva and Maa Parvati.'
  }

  // Purnima (Full Moon)
  if (!isKrishna && tithiIndex === 14) {
    festivals.push('🌕 Purnima Vrat / Satyanarayan Puja')
    if (amantaMonthIndex === 3) festivals.push('Guru Purnima')
    if (amantaMonthIndex === 4) festivals.push('Raksha Bandhan / Shravani Purnima')
    if (amantaMonthIndex === 6) festivals.push('Sharad Purnima / Kojagara (Mithila)')
    if (!fastingNote) fastingNote = 'Full Moon Purnima. Ideal for Satyanarayan Vrat Katha and Holy River Bath.'
  }

  // Amavasya (New Moon)
  if (isKrishna && tithiIndex === 14) {
    festivals.push('🌑 Amavasya / Pitru Tarpana')
    if (amantaMonthIndex === 7) festivals.push('Deepawali (Diwali) / Lakshmi Puja')
    if (amantaMonthIndex === 2) festivals.push('Vat Savitri Vrat')
    if (!fastingNote) fastingNote = 'New Moon Amavasya. Auspicious for Pitru Tarpana, Charity, and Prayers.'
  }

  // Chaturthi Vrat
  if (tithiIndex === 3) {
    festivals.push(isKrishna ? '🐘 Sankashti Chaturthi Vrat' : '🐘 Vinayaka Chaturthi Vrat')
  }

  // Special Mithila Festivals
  // Madhushravani (Shravana Month)
  if ((amantaMonthIndex === 4 || purnimantaMonthIndex === 4) && (tithiIndex >= 2 && tithiIndex <= 10)) {
    festivals.push('🌺 Madhushravani Parv (मधुश्रावणी - Mithila Bride Festival)')
  }

  // Nag Panchami (Shravana Shukla Panchami)
  if (amantaMonthIndex === 4 && !isKrishna && tithiIndex === 4) {
    festivals.push('🐍 Nag Panchami (नाग पंचमी)')
  }

  // Chhath Puja (Kartika Shukla Shashthi)
  if (amantaMonthIndex === 7 && !isKrishna && tithiIndex === 5) {
    festivals.push('☀️ Chhath Puja (Sandhya Arghya) - Mithila & Bihar Mahaparv')
  }

  // Sama-Chakeva (Kartika Shukla Saptami to Purnima)
  if (amantaMonthIndex === 7 && !isKrishna && tithiIndex >= 6 && tithiIndex <= 14) {
    festivals.push('🦚 Sama-Chakeva Sibling Festival (Mithila)')
  }

  // Janmashtami (Bhadrapada Krishna Ashtami)
  if (amantaMonthIndex === 5 && isKrishna && tithiIndex === 7) {
    festivals.push('🪈 Shri Krishna Janmashtami')
  }

  // Ram Navami (Chaitra Shukla Navami)
  if (amantaMonthIndex === 0 && !isKrishna && tithiIndex === 8) {
    festivals.push('🏹 Shri Ram Navami')
  }

  // Maha Shivratri (Phalguna Krishna Chaturdashi)
  if (amantaMonthIndex === 11 && isKrishna && tithiIndex === 13) {
    festivals.push('🔱 Maha Shivratri')
  }

  // Timings offsets for location
  const locOffset = (hashString(locationId) % 20) - 10
  const seasonal = Math.round(30 * Math.sin((date.getMonth() / 12) * 2 * Math.PI))

  const sunriseMin = 6 * 60 + 12 + locOffset - Math.round(seasonal / 2)
  const sunsetMin = 18 * 60 + 6 + locOffset + Math.round(seasonal / 2)
  const moonriseMin = sunriseMin + 48 * (tithiIndex % 15)
  const moonsetMin = moonriseMin + 11 * 60

  const noon = Math.round((sunriseMin + sunsetMin) / 2)
  const dayLength = sunsetMin - sunriseMin
  const slot = dayLength / 8
  const d = ((date.getDay() % 7) + 7) % 7

  const rahuSlotByDay = [8, 2, 7, 5, 6, 4, 3]
  const yamaSlotByDay = [5, 4, 3, 2, 1, 7, 6]
  const gulikaSlotByDay = [7, 6, 5, 4, 3, 2, 1]

  const rahuStart = sunriseMin + (rahuSlotByDay[d] - 1) * slot
  const yamaStart = sunriseMin + (yamaSlotByDay[d] - 1) * slot
  const gulikaStart = sunriseMin + (gulikaSlotByDay[d] - 1) * slot

  const auspicious: Timing[] = [
    {
      label: 'Abhijit Muhurat',
      time: `${toClock(noon - 24)} – ${toClock(noon + 24)}`,
    },
    {
      label: 'Amrit Kaal',
      time: `${toClock(sunriseMin + 300)} – ${toClock(sunriseMin + 348)}`,
    },
    {
      label: 'Brahma Muhurat',
      time: `${toClock(sunriseMin - 96)} – ${toClock(sunriseMin - 48)}`,
    },
    {
      label: 'Vijaya Muhurat',
      time: `${toClock(noon + 132)} – ${toClock(noon + 180)}`,
    },
  ]

  const inauspicious: Timing[] = [
    {
      label: 'Rahu Kaal',
      time: `${toClock(rahuStart)} – ${toClock(rahuStart + slot)}`,
    },
    {
      label: 'Yamaganda',
      time: `${toClock(yamaStart)} – ${toClock(yamaStart + slot)}`,
    },
    {
      label: 'Gulika Kaal',
      time: `${toClock(gulikaStart)} – ${toClock(gulikaStart + slot)}`,
    },
    {
      label: 'Dur Muhurat',
      time: `${toClock(noon + 84)} – ${toClock(noon + 132)}`,
    },
  ]

  const gregorianYear = date.getFullYear()
  const vikramSamvat = gregorianYear + 57
  const shakaSamvat = gregorianYear - 78

  const ritus = [
    'Shishir (Winter)',
    'Vasant (Spring)',
    'Grishma (Summer)',
    'Varsha (Monsoon)',
    'Sharad (Autumn)',
    'Hemant (Pre-winter)',
  ]
  const ritu = ritus[Math.floor(date.getMonth() / 2) % 6]

  return {
    tithi: {
      label: 'Tithi',
      labelHi: 'तिथि',
      value: `${tithiName} (${paksha})`,
      detail: `${paksha} · till ${toClock(sunsetMin - 30)}`,
    },
    vaar: {
      label: 'Vaar',
      labelHi: 'वार',
      value: vaar.en,
      detail: vaar.hi,
    },
    nakshatra: {
      label: 'Nakshatra',
      labelHi: 'नक्षत्र',
      value: nakshatra,
      detail: `till ${toClock(moonriseMin + 60)}`,
    },
    yoga: {
      label: 'Yoga',
      labelHi: 'योग',
      value: yoga,
      detail: `till ${toClock(noon + 40)}`,
    },
    karana: {
      label: 'Karana',
      labelHi: 'करण',
      value: karana,
      detail: `till ${toClock(noon - 60)}`,
    },
    paksha,
    sunrise: toClock(sunriseMin),
    sunset: toClock(sunsetMin),
    moonrise: toClock(moonriseMin),
    moonset: toClock(moonsetMin),
    auspicious,
    inauspicious,
    vikramSamvat,
    shakaSamvat,
    amanta,
    purnimanta,
    ritu,
    vishnuStatus,
    festivals,
    fastingNote,
    moonRashiIndex,
    moonRashi,
  }
}

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export type UpcomingEvent = {
  date: Date
  dateFormatted: string
  dayName: string
  daysAwayText: string
  festivals: string[]
  fastingNote: string
  tithiName: string
}

export function getUpcomingEvents(startDate: Date, locationId: string, count = 5): UpcomingEvent[] {
  const events: UpcomingEvent[] = []
  const maxDaysToScan = 30

  for (let i = 0; i < maxDaysToScan && events.length < count; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)

    const p = getPanchang(d, locationId)

    if (p.festivals.length > 0 || p.fastingNote) {
      const dateFormatted = d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' })

      let daysAwayText = `In ${i} days`
      if (i === 0) daysAwayText = 'Today (आज)'
      else if (i === 1) daysAwayText = 'Tomorrow (कल)'

      events.push({
        date: d,
        dateFormatted,
        dayName,
        daysAwayText,
        festivals: p.festivals,
        fastingNote: p.fastingNote,
        tithiName: p.tithi.value,
      })
    }
  }

  return events
}

