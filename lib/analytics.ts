import "server-only"
import fs from "fs"
import path from "path"

export type AnalyticsEvent = {
  sessionId: string
  path: string
  referrer: string
  device: "Mobile" | "Desktop" | "Tablet"
  timestamp: string // ISO string
  durationSeconds: number // Time spent on page/site
}

export type AnalyticsSummary = {
  totalVisitors: number
  totalPageviews: number
  todayVisitors: number
  avgTimeSpentSeconds: number
  topPages: { path: string; views: number; avgTimeSeconds: number }[]
  recentVisitors: AnalyticsEvent[]
  deviceBreakdown: { mobilePercent: number; desktopPercent: number }
}

const DATA_FILE = path.join(process.cwd(), "data", "analytics.json")

/** Helper to read events from data/analytics.json */
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
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error("[Analytics] Failed reading analytics.json:", err)
    return []
  }
}

/** Helper to write events to data/analytics.json */
async function writeAnalyticsEvents(events: AnalyticsEvent[]): Promise<void> {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }
  // Keep last 5000 events to manage file size cleanly
  const trimmed = events.slice(0, 5000)
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(trimmed, null, 2), "utf-8")
}

/** Track or update a visitor session event */
export async function trackSessionEvent(data: {
  sessionId: string
  path: string
  referrer?: string
  device?: "Mobile" | "Desktop" | "Tablet"
  durationSeconds?: number
}): Promise<void> {
  const events = await readAnalyticsEvents()
  const nowISO = new Date().toISOString()

  // Find if event exists for this session & path in the last 12 hours
  const existingIdx = events.findIndex(
    (e) => e.sessionId === data.sessionId && e.path === data.path
  )

  if (existingIdx !== -1) {
    // Update existing duration if higher
    const existing = events[existingIdx]
    const updatedDuration = Math.max(existing.durationSeconds || 0, data.durationSeconds || 0)
    events[existingIdx] = {
      ...existing,
      durationSeconds: updatedDuration,
    }
  } else {
    // New event entry
    const newEvent: AnalyticsEvent = {
      sessionId: data.sessionId,
      path: data.path || "/",
      referrer: data.referrer || "Direct",
      device: data.device || "Desktop",
      timestamp: nowISO,
      durationSeconds: Math.max(1, data.durationSeconds || 1),
    }
    events.unshift(newEvent)
  }

  await writeAnalyticsEvents(events)
}

/** Get aggregated analytics statistics for Admin Dashboard */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const events = await readAnalyticsEvents()

  if (events.length === 0) {
    return {
      totalVisitors: 0,
      totalPageviews: 0,
      todayVisitors: 0,
      avgTimeSpentSeconds: 0,
      topPages: [],
      recentVisitors: [],
      deviceBreakdown: { mobilePercent: 50, desktopPercent: 50 },
    }
  }

  // Unique session IDs
  const uniqueSessions = new Set(events.map((e) => e.sessionId))
  const totalVisitors = uniqueSessions.size
  const totalPageviews = events.length

  // Today's visitors
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayEvents = events.filter((e) => e.timestamp && e.timestamp.slice(0, 10) === todayStr)
  const todayVisitors = new Set(todayEvents.map((e) => e.sessionId)).size

  // Average time spent (sum of maximum duration per session)
  const sessionDurations = new Map<string, number>()
  events.forEach((e) => {
    const current = sessionDurations.get(e.sessionId) || 0
    sessionDurations.set(e.sessionId, Math.max(current, e.durationSeconds || 0))
  })
  const totalDuration = Array.from(sessionDurations.values()).reduce((sum, d) => sum + d, 0)
  const avgTimeSpentSeconds = totalVisitors > 0 ? Math.round(totalDuration / totalVisitors) : 0

  // Top Pages
  const pageStats = new Map<string, { views: number; totalSeconds: number }>()
  events.forEach((e) => {
    const stat = pageStats.get(e.path) || { views: 0, totalSeconds: 0 }
    pageStats.set(e.path, {
      views: stat.views + 1,
      totalSeconds: stat.totalSeconds + (e.durationSeconds || 0),
    })
  })

  const topPages = Array.from(pageStats.entries())
    .map(([pathStr, stat]) => ({
      path: pathStr,
      views: stat.views,
      avgTimeSeconds: Math.round(stat.totalSeconds / stat.views),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)

  // Device Breakdown
  const mobileCount = events.filter((e) => e.device === "Mobile").length
  const mobilePercent = Math.round((mobileCount / totalPageviews) * 100)
  const desktopPercent = 100 - mobilePercent

  // Recent Visitors (last 15 events)
  const recentVisitors = events.slice(0, 15)

  return {
    totalVisitors,
    totalPageviews,
    todayVisitors,
    avgTimeSpentSeconds,
    topPages,
    recentVisitors,
    deviceBreakdown: { mobilePercent, desktopPercent },
  }
}
