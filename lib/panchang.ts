// Deterministic Panchang data generation.
// NOTE: This produces representative, illustrative almanac values based on the
// selected date and location so the UI is fully populated. It is not a
// substitute for precise astronomical calculation.

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
]

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
  'Vishti',
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
}

// Simple deterministic hash from a string.
function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

// Convert minutes-from-midnight to a 12-hour clock string.
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

function daysSinceEpoch(date: Date): number {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor(utc / 86400000)
}

export function getPanchang(date: Date, locationId: string): Panchang {
  const dayNum = daysSinceEpoch(date)
  const seed = hashString(`${dayNum}-${locationId}`)

  const tithiIndex = ((dayNum % 30) + 30) % 30
  const isKrishna = tithiIndex >= 15
  const tithiName = TITHIS[tithiIndex % 15]
  const paksha = isKrishna ? PAKSHAS[1] : PAKSHAS[0]

  const nakshatra = NAKSHATRAS[(dayNum + (seed % 3)) % NAKSHATRAS.length]
  const yoga = YOGAS[(dayNum * 2 + (seed % 5)) % YOGAS.length]
  const karana = KARANAS[(dayNum * 2) % KARANAS.length]
  const vaar = VAARS[((date.getDay() % 7) + 7) % 7]

  // Location + date derived timing offsets (in minutes).
  const locOffset = (hashString(locationId) % 20) - 10
  const seasonal = Math.round(30 * Math.sin((dayNum / 365) * 2 * Math.PI))

  const sunriseMin = 6 * 60 + 12 + locOffset - Math.round(seasonal / 2)
  const sunsetMin = 18 * 60 + 6 + locOffset + Math.round(seasonal / 2)
  const moonriseMin = sunriseMin + 48 * (tithiIndex % 15) + (seed % 25)
  const moonsetMin = moonriseMin + 11 * 60 + (seed % 40)

  // Abhijit muhurat sits around local solar noon.
  const noon = Math.round((sunriseMin + sunsetMin) / 2)
  const dayLength = sunsetMin - sunriseMin

  // Rahu Kaal depends on the weekday (1/8th of daylight).
  const rahuSlotByDay = [8, 2, 7, 5, 6, 4, 3] // Sun..Sat (index of 8ths)
  const yamaSlotByDay = [5, 4, 3, 2, 1, 7, 6]
  const gulikaSlotByDay = [7, 6, 5, 4, 3, 2, 1]
  const slot = dayLength / 8
  const d = ((date.getDay() % 7) + 7) % 7

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
      time: `${toClock(sunriseMin + 300 + (seed % 40))} – ${toClock(
        sunriseMin + 348 + (seed % 40),
      )}`,
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

  const monthIndex = date.getMonth()
  const amanta = AMANTA_MONTHS[(monthIndex + (isKrishna ? 0 : 0)) % 12]
  const purnimanta = AMANTA_MONTHS[isKrishna ? (monthIndex + 1) % 12 : monthIndex % 12]
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
  const ritu = ritus[Math.floor(monthIndex / 2) % 6]

  return {
    tithi: {
      label: 'Tithi',
      labelHi: 'तिथि',
      value: tithiName,
      detail: `${paksha} · till ${toClock(sunsetMin - 90 + (seed % 60))}`,
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
      detail: `till ${toClock(moonriseMin + 60 + (seed % 90))}`,
    },
    yoga: {
      label: 'Yoga',
      labelHi: 'योग',
      value: yoga,
      detail: `till ${toClock(noon + 40 + (seed % 120))}`,
    },
    karana: {
      label: 'Karana',
      labelHi: 'करण',
      value: karana,
      detail: `till ${toClock(noon - 60 + (seed % 100))}`,
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
  }
}
