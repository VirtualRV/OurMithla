/** Client-safe analytics types */

export type DeviceKind = "Mobile" | "Desktop" | "Tablet"

export type VisitorLocation = {
  source: "device" | "ip" | "timezone" | "unknown"
  city?: string
  region?: string
  country?: string
  countryCode?: string
  latitude?: number
  longitude?: number
  timeZone?: string
  ip?: string
  label: string
}

export type DeviceDetails = {
  kind: DeviceKind
  userAgent?: string
  browser?: string
  os?: string
  screen?: string
  language?: string
  timeZone?: string
  touch?: boolean
}

export type CustomerDetails = {
  name?: string
  email?: string
  phone?: string
  source?: "contact" | "submit" | "known"
}

export type AnalyticsEvent = {
  sessionId: string
  path: string
  /** Human page title from document.title */
  pageName: string
  referrer: string
  device: DeviceKind
  deviceDetails?: DeviceDetails
  location?: VisitorLocation
  customer?: CustomerDetails
  timestamp: string
  durationSeconds: number
}

export type LocationStat = {
  label: string
  city?: string
  region?: string
  country?: string
  visits: number
}

export type AnalyticsRange = "today" | "7d" | "30d" | "90d" | "all"

export type DailyPoint = {
  date: string
  visitors: number
  pageviews: number
}

export type AnalyticsSummary = {
  range: AnalyticsRange
  rangeLabel: string
  from: string | null
  to: string
  totalVisitors: number
  totalPageviews: number
  todayVisitors: number
  avgTimeSpentSeconds: number
  topPages: { path: string; pageName: string; views: number; avgTimeSeconds: number }[]
  topLocations: LocationStat[]
  recentVisitors: AnalyticsEvent[]
  daily: DailyPoint[]
  deviceBreakdown: {
    mobilePercent: number
    desktopPercent: number
    tabletPercent: number
  }
  customersSeen: number
}
