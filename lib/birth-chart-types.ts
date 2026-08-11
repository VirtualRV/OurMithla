/**
 * Shared birth-place / chart types (safe for client imports).
 */

import type { Rashi } from "@/lib/horoscope"
import type { AstrologyProviderId } from "@/lib/astrology-providers/catalog"

export type BirthPlace = {
  id: string
  city: string
  region: string
  lat: number
  lon: number
  /** IANA timezone id, e.g. Asia/Kolkata, Europe/London, America/New_York */
  timeZoneId: string
  /** Offset hours at the birth moment (derived; not a substitute for timeZoneId) */
  tzOffsetHours?: number
}

export const BIRTH_PLACE_PRESETS: BirthPlace[] = [
  {
    id: "darbhanga",
    city: "Darbhanga",
    region: "Bihar, India",
    lat: 26.1542,
    lon: 85.8918,
    timeZoneId: "Asia/Kolkata",
  },
  {
    id: "madhubani",
    city: "Madhubani",
    region: "Bihar, India",
    lat: 26.3537,
    lon: 86.0717,
    timeZoneId: "Asia/Kolkata",
  },
  {
    id: "janakpur",
    city: "Janakpur",
    region: "Madhesh, Nepal",
    lat: 26.7288,
    lon: 85.9263,
    timeZoneId: "Asia/Kathmandu",
  },
  {
    id: "patna",
    city: "Patna",
    region: "Bihar, India",
    lat: 25.5941,
    lon: 85.1376,
    timeZoneId: "Asia/Kolkata",
  },
  {
    id: "kathmandu",
    city: "Kathmandu",
    region: "Bagmati, Nepal",
    lat: 27.7172,
    lon: 85.324,
    timeZoneId: "Asia/Kathmandu",
  },
  {
    id: "delhi",
    city: "New Delhi",
    region: "Delhi, India",
    lat: 28.6139,
    lon: 77.209,
    timeZoneId: "Asia/Kolkata",
  },
  {
    id: "varanasi",
    city: "Varanasi",
    region: "Uttar Pradesh, India",
    lat: 25.3176,
    lon: 82.9739,
    timeZoneId: "Asia/Kolkata",
  },
  {
    id: "mumbai",
    city: "Mumbai",
    region: "Maharashtra, India",
    lat: 19.076,
    lon: 72.8777,
    timeZoneId: "Asia/Kolkata",
  },
  {
    id: "kolkata",
    city: "Kolkata",
    region: "West Bengal, India",
    lat: 22.5726,
    lon: 88.3639,
    timeZoneId: "Asia/Kolkata",
  },
  {
    id: "london",
    city: "London",
    region: "England, United Kingdom",
    lat: 51.5074,
    lon: -0.1278,
    timeZoneId: "Europe/London",
  },
  {
    id: "newyork",
    city: "New York",
    region: "New York, United States",
    lat: 40.7128,
    lon: -74.006,
    timeZoneId: "America/New_York",
  },
  {
    id: "dubai",
    city: "Dubai",
    region: "United Arab Emirates",
    lat: 25.2048,
    lon: 55.2708,
    timeZoneId: "Asia/Dubai",
  },
]

export type PlanetId =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn"
  | "Rahu"
  | "Ketu"

export type PlanetPlacement = {
  id: PlanetId
  nameHi: string
  longitude: number
  rashi: Rashi
  degreeInRashi: number
  house: number
  dignity: string
  retrograde?: boolean
}

export type HouseInfo = {
  number: number
  rashi: Rashi
  lord: string
  themes: string
  planets: PlanetId[]
}

export type LifePrediction = {
  key: "personality" | "career" | "wealth" | "relationships" | "health" | "family" | "spiritual" | "timing"
  title: string
  titleHi: string
  summary: string
  strengths: string[]
  watchouts: string[]
  score: number
}

export type BirthChart = {
  name: string
  birthDate: string
  birthTime: string
  place: BirthPlace
  utcISO: string
  jdUt: number
  ayanamsha: number
  engine: "swiss-ephemeris-lahiri" | "prokerala" | "astrologyapi" | "freeastroapi"
  houseSystem: "whole-sign" | "provider"
  lagna: Rashi
  lagnaDegree: number
  sunRashi: Rashi
  moonRashi: Rashi
  nakshatra: string
  nakshatraPada: number
  moonDegree: number
  planets: PlanetPlacement[]
  houses: HouseInfo[]
  overview: string
  predictions: LifePrediction[]
  remedies: string[]
  disclaimer: string
  /** Which calculation backend produced this chart */
  provider?: AstrologyProviderId
  providerLabel?: string
}
