import "server-only"
import fs from "fs"
import path from "path"
import type {
  AnalyticsEvent,
  AnalyticsSummary,
  CustomerDetails,
  DeviceDetails,
  DeviceKind,
  VisitorLocation,
} from "@/lib/analytics-types"

export type {
  AnalyticsEvent,
  AnalyticsSummary,
  CustomerDetails,
  DeviceDetails,
  DeviceKind,
  VisitorLocation,
} from "@/lib/analytics-types"

const DATA_FILE = path.join(process.cwd(), "data", "analytics.json")

function normalizeEvent(raw: Partial<AnalyticsEvent> & { path?: string }): AnalyticsEvent {
  return {
    sessionId: String(raw.sessionId || "unknown"),
    path: String(raw.path || "/"),
    pageName: String(raw.pageName || raw.path || "Untitled"),
    referrer: String(raw.referrer || "Direct"),
    device: (raw.device as DeviceKind) || "Desktop",
    deviceDetails: raw.deviceDetails,
    location: raw.location,
    customer: raw.customer,
    timestamp: String(raw.timestamp || new Date().toISOString()),
    durationSeconds: Math.max(1, Number(raw.durationSeconds) || 1),
  }
}

async function readAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const dir = path.dirname(DATA_FILE)
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true })
      }
      await fs.promises.writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8")
      return []
    }
    const content = await fs.promises.readFile(DATA_FILE, "utf-8")
    const data = JSON.parse(content)
    if (!Array.isArray(data)) return []
    return data.map((e) => normalizeEvent(e))
  } catch (err) {
    console.error("[Analytics] Failed reading analytics.json:", err)
    return []
  }
}

async function writeAnalyticsEvents(events: AnalyticsEvent[]): Promise<void> {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }
  const trimmed = events.slice(0, 5000)
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(trimmed, null, 2), "utf-8")
}

export async function trackSessionEvent(data: {
  sessionId: string
  path: string
  pageName?: string
  referrer?: string
  device?: DeviceKind
  deviceDetails?: DeviceDetails
  location?: VisitorLocation
  customer?: CustomerDetails
  durationSeconds?: number
}): Promise<void> {
  const events = await readAnalyticsEvents()
  const nowISO = new Date().toISOString()

  const existingIdx = events.findIndex(
    (e) => e.sessionId === data.sessionId && e.path === data.path,
  )

  if (existingIdx !== -1) {
    const existing = events[existingIdx]
    const updatedDuration = Math.max(existing.durationSeconds || 0, data.durationSeconds || 0)
    events[existingIdx] = {
      ...existing,
      durationSeconds: updatedDuration,
      pageName: data.pageName || existing.pageName,
      deviceDetails: data.deviceDetails || existing.deviceDetails,
      location: data.location?.label ? data.location : existing.location,
      customer: data.customer?.email || data.customer?.name ? data.customer : existing.customer,
      timestamp: nowISO,
    }
  } else {
    events.unshift(
      normalizeEvent({
        sessionId: data.sessionId,
        path: data.path || "/",
        pageName: data.pageName,
        referrer: data.referrer || "Direct",
        device: data.device || "Desktop",
        deviceDetails: data.deviceDetails,
        location: data.location,
        customer: data.customer,
        timestamp: nowISO,
        durationSeconds: Math.max(1, data.durationSeconds || 1),
      }),
    )
  }

  await writeAnalyticsEvents(events)
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const events = await readAnalyticsEvents()

  if (events.length === 0) {
    return {
      totalVisitors: 0,
      totalPageviews: 0,
      todayVisitors: 0,
      avgTimeSpentSeconds: 0,
      topPages: [],
      topLocations: [],
      recentVisitors: [],
      deviceBreakdown: { mobilePercent: 50, desktopPercent: 50, tabletPercent: 0 },
      customersSeen: 0,
    }
  }

  const uniqueSessions = new Set(events.map((e) => e.sessionId))
  const totalVisitors = uniqueSessions.size
  const totalPageviews = events.length

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayEvents = events.filter((e) => e.timestamp?.slice(0, 10) === todayStr)
  const todayVisitors = new Set(todayEvents.map((e) => e.sessionId)).size

  const sessionDurations = new Map<string, number>()
  events.forEach((e) => {
    sessionDurations.set(e.sessionId, Math.max(sessionDurations.get(e.sessionId) || 0, e.durationSeconds || 0))
  })
  const totalDuration = Array.from(sessionDurations.values()).reduce((sum, d) => sum + d, 0)
  const avgTimeSpentSeconds = totalVisitors > 0 ? Math.round(totalDuration / totalVisitors) : 0

  const pageStats = new Map<string, { pageName: string; views: number; totalSeconds: number }>()
  events.forEach((e) => {
    const stat = pageStats.get(e.path) || { pageName: e.pageName, views: 0, totalSeconds: 0 }
    pageStats.set(e.path, {
      pageName: e.pageName || stat.pageName,
      views: stat.views + 1,
      totalSeconds: stat.totalSeconds + (e.durationSeconds || 0),
    })
  })

  const topPages = Array.from(pageStats.entries())
    .map(([pathStr, stat]) => ({
      path: pathStr,
      pageName: stat.pageName,
      views: stat.views,
      avgTimeSeconds: Math.round(stat.totalSeconds / stat.views),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  const locationStats = new Map<string, { label: string; city?: string; region?: string; country?: string; visits: number }>()
  events.forEach((e) => {
    const loc = e.location
    if (!loc?.label || loc.label === "Unknown") return
    const key = loc.label
    const cur = locationStats.get(key) || {
      label: loc.label,
      city: loc.city,
      region: loc.region,
      country: loc.country || loc.countryCode,
      visits: 0,
    }
    cur.visits += 1
    locationStats.set(key, cur)
  })

  const topLocations = Array.from(locationStats.values())
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)

  const mobileCount = events.filter((e) => e.device === "Mobile").length
  const tabletCount = events.filter((e) => e.device === "Tablet").length
  const mobilePercent = Math.round((mobileCount / totalPageviews) * 100)
  const tabletPercent = Math.round((tabletCount / totalPageviews) * 100)
  const desktopPercent = Math.max(0, 100 - mobilePercent - tabletPercent)

  const customersSeen = new Set(
    events
      .filter((e) => e.customer?.email || e.customer?.name)
      .map((e) => e.customer?.email || e.customer?.name || ""),
  ).size

  return {
    totalVisitors,
    totalPageviews,
    todayVisitors,
    avgTimeSpentSeconds,
    topPages,
    topLocations,
    recentVisitors: events.slice(0, 40),
    deviceBreakdown: { mobilePercent, desktopPercent, tabletPercent },
    customersSeen,
  }
}
