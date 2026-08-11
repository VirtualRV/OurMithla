/** Client-safe astrology provider catalog */

export type AstrologyProviderId =
  | "swiss"
  | "prokerala"
  | "astrologyapi"
  | "freeastroapi"

export type AstrologyProviderInfo = {
  id: AstrologyProviderId
  label: string
  shortLabel: string
  description: string
  /** Always true for swiss; others need env credentials */
  needsCredentials: boolean
  docsUrl: string
  features: string[]
}

export const ASTROLOGY_PROVIDERS: AstrologyProviderInfo[] = [
  {
    id: "swiss",
    label: "Swiss Ephemeris (Local)",
    shortLabel: "Swiss Ephemeris",
    description:
      "Runs on OurMithla servers with Lahiri ayanāṃśa. Full control, no third-party fee. Best default.",
    needsCredentials: false,
    docsUrl: "https://www.astro.com/swisseph/",
    features: ["Kundli planets", "Lagna", "Nakshatra", "Whole-sign houses", "Life guidance"],
  },
  {
    id: "prokerala",
    label: "Prokerala Astrology API",
    shortLabel: "Prokerala",
    description: "Hosted API for kundli, dasha, matching, and panchang. OAuth2 client credentials.",
    needsCredentials: true,
    docsUrl: "https://api.prokerala.com/",
    features: ["Kundli advanced", "Dasha", "Matching", "Panchang"],
  },
  {
    id: "astrologyapi",
    label: "AstrologyAPI.com (VedicRishi)",
    shortLabel: "AstrologyAPI",
    description: "Birth chart, kundli matching, numerology. Basic Auth with User ID + API Key.",
    needsCredentials: true,
    docsUrl: "https://astrologyapi.com/docs/api-ref",
    features: ["Planets / kundli", "Matching", "Numerology"],
  },
  {
    id: "freeastroapi",
    label: "FreeAstroAPI",
    shortLabel: "FreeAstroAPI",
    description: "Free-tier friendly Vedic chart API (chart, dasha, panchang). API key header.",
    needsCredentials: true,
    docsUrl: "https://www.freeastroapi.com/docs",
    features: ["Vedic chart", "Dasha", "Panchang", "Matching"],
  },
]

export function getProviderInfo(id: AstrologyProviderId): AstrologyProviderInfo {
  return ASTROLOGY_PROVIDERS.find((p) => p.id === id) ?? ASTROLOGY_PROVIDERS[0]
}
