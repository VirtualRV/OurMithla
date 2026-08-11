import "server-only"
import { generateBirthChart } from "@/lib/birth-chart"
import type { ChartProviderRequest, ChartProviderResult } from "@/lib/astrology-providers/types"
import { getProviderInfo, type AstrologyProviderId } from "@/lib/astrology-providers/catalog"
import { isProkeralaConfigured, fetchProkeralaChart } from "@/lib/astrology-providers/prokerala"
import {
  isAstrologyApiConfigured,
  fetchAstrologyApiChart,
} from "@/lib/astrology-providers/astrologyapi"
import {
  isFreeAstroApiConfigured,
  fetchFreeAstroApiChart,
} from "@/lib/astrology-providers/freeastroapi"
import type { SiteSettings } from "@/lib/settings-defaults"

export type AvailableProvider = {
  id: AstrologyProviderId
  label: string
  shortLabel: string
  description: string
  docsUrl: string
  features: string[]
  configured: boolean
  enabled: boolean
  available: boolean
}

function providerEnabledInSettings(
  id: AstrologyProviderId,
  settings: SiteSettings,
): boolean {
  switch (id) {
    case "swiss":
      return settings.enableProviderSwiss !== false
    case "prokerala":
      return settings.enableProviderProkerala !== false
    case "astrologyapi":
      return settings.enableProviderAstrologyApi !== false
    case "freeastroapi":
      return settings.enableProviderFreeAstroApi !== false
    default:
      return true
  }
}

function isConfigured(id: AstrologyProviderId): boolean {
  switch (id) {
    case "swiss":
      return true
    case "prokerala":
      return isProkeralaConfigured()
    case "astrologyapi":
      return isAstrologyApiConfigured()
    case "freeastroapi":
      return isFreeAstroApiConfigured()
    default:
      return false
  }
}

export function listAvailableProviders(settings: SiteSettings): AvailableProvider[] {
  const ids: AstrologyProviderId[] = ["swiss", "prokerala", "astrologyapi", "freeastroapi"]
  return ids.map((id) => {
    const info = getProviderInfo(id)
    const configured = isConfigured(id)
    const enabled = providerEnabledInSettings(id, settings)
    return {
      id,
      label: info.label,
      shortLabel: info.shortLabel,
      description: info.description,
      docsUrl: info.docsUrl,
      features: info.features,
      configured,
      enabled,
      available: configured && enabled && settings.enableBirthChart,
    }
  })
}

export async function generateChartWithProvider(
  provider: AstrologyProviderId,
  req: ChartProviderRequest,
  settings: SiteSettings,
): Promise<ChartProviderResult> {
  const available = listAvailableProviders(settings).find((p) => p.id === provider)
  if (!available?.available) {
    if (!available?.configured) {
      throw new Error(
        `${getProviderInfo(provider).label} is not configured. Add credentials in .env and restart.`,
      )
    }
    throw new Error(`${getProviderInfo(provider).label} is disabled by admin.`)
  }

  if (provider === "swiss") {
    const chart = generateBirthChart({
      name: req.name,
      birthDate: req.birthDate,
      birthTime: req.birthTime,
      place: req.place,
    })
    return {
      provider: "swiss",
      providerLabel: getProviderInfo("swiss").label,
      chart: {
        ...chart,
        provider: "swiss",
        providerLabel: getProviderInfo("swiss").label,
      },
    }
  }

  if (provider === "prokerala") return fetchProkeralaChart(req)
  if (provider === "astrologyapi") return fetchAstrologyApiChart(req)
  if (provider === "freeastroapi") return fetchFreeAstroApiChart(req)

  throw new Error(`Unknown provider: ${provider}`)
}
