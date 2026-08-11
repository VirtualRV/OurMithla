import "server-only"
import {
  dateToJulianDay,
  calculatePosition,
  calculateHouses,
  setSiderealMode,
  getAyanamsa,
  SiderealMode,
  Planet,
  HouseSystem,
  CalculationFlag,
} from "@swisseph/node"

export type SwissPlanetId =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Rahu"
  | "Ketu"

export type SwissPlanetPos = {
  id: SwissPlanetId
  longitude: number
  latitude: number
  speed: number
  retrograde: boolean
}

export type SwissChartCore = {
  jdUt: number
  ayanamsha: number
  /** Sidereal Lagna longitude 0–360 */
  lagnaLongitude: number
  tropicalAscendant: number
  mc: number
  planets: SwissPlanetPos[]
}

const SE_MEAN_NODE = 10

const FLAGS =
  CalculationFlag.Sidereal | CalculationFlag.SwissEphemeris | CalculationFlag.Speed

function norm360(x: number): number {
  return ((x % 360) + 360) % 360
}

/**
 * Compute sidereal (Lahiri / Chitrapaksha) planetary longitudes + Lagna
 * using Swiss Ephemeris for a UTC Date.
 */
export function computeSwissLahiriChart(
  birthUtc: Date,
  lat: number,
  lon: number,
): SwissChartCore {
  setSiderealMode(SiderealMode.Lahiri)

  const jdUt = dateToJulianDay(birthUtc)
  const ayanamsha = getAyanamsa(jdUt)

  // Houses from Swiss Ephemeris are tropical; convert ASC to sidereal via Lahiri.
  const houses = calculateHouses(jdUt, lat, lon, HouseSystem.Placidus)
  const tropicalAscendant = houses.ascendant
  const lagnaLongitude = norm360(tropicalAscendant - ayanamsha)

  const bodyMap: Array<{ id: SwissPlanetId; body: number }> = [
    { id: "Sun", body: Planet.Sun },
    { id: "Moon", body: Planet.Moon },
    { id: "Mercury", body: Planet.Mercury },
    { id: "Venus", body: Planet.Venus },
    { id: "Mars", body: Planet.Mars },
    { id: "Jupiter", body: Planet.Jupiter },
    { id: "Saturn", body: Planet.Saturn },
    { id: "Rahu", body: SE_MEAN_NODE },
  ]

  const planets: SwissPlanetPos[] = bodyMap.map(({ id, body }) => {
    const pos = calculatePosition(jdUt, body, FLAGS)
    return {
      id,
      longitude: norm360(pos.longitude),
      latitude: pos.latitude,
      speed: pos.longitudeSpeed,
      retrograde: pos.longitudeSpeed < 0,
    }
  })

  const rahu = planets.find((p) => p.id === "Rahu")!
  planets.push({
    id: "Ketu",
    longitude: norm360(rahu.longitude + 180),
    latitude: -rahu.latitude,
    speed: rahu.speed,
    retrograde: true,
  })

  return {
    jdUt,
    ayanamsha,
    lagnaLongitude,
    tropicalAscendant,
    mc: houses.mc,
    planets,
  }
}
