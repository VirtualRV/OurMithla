import "server-only"
import type { AstrologyProviderId } from "@/lib/astrology-providers/catalog"
import type { BirthChart, BirthPlace } from "@/lib/birth-chart-types"

export type ChartProviderRequest = {
  name: string
  birthDate: string
  birthTime: string
  place: BirthPlace
}

export type ChartProviderResult = {
  provider: AstrologyProviderId
  providerLabel: string
  chart: BirthChart
  /** Original upstream payload for comparison / power users */
  raw?: unknown
  warnings?: string[]
}

export function assertConfigured(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}
