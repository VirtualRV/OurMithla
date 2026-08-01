"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  Smartphone,
  Monitor,
  RefreshCw,
  Globe,
  FileText,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react"
import type { AnalyticsSummary } from "@/lib/analytics"

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAnalytics() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/analytics")
      if (!res.ok) {
        throw new Error("Failed to load analytics")
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  function formatTime(seconds: number): string {
    if (!seconds || seconds <= 0) return "0s"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
  }

  function formatTimestamp(iso: string): string {
    if (!iso) return "Just now"
    const d = new Date(iso)
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-foreground">Traffic & Visitor Analytics</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" /> Live Tracking
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time tracking of visitor traffic, pageviews, top pages, and time spent on OurMithla.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground shadow-xs hover:bg-muted transition-all shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Visitors */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Visitors
            </span>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-foreground">
              {loading ? "..." : data?.totalVisitors ?? 0}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Unique sessions</span>
          </div>
        </div>

        {/* Total Pageviews */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Pageviews
            </span>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Eye className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-foreground">
              {loading ? "..." : data?.totalPageviews ?? 0}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Page visits</span>
          </div>
        </div>

        {/* Avg Time Spent */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Avg Time Spent
            </span>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-foreground">
              {loading ? "..." : formatTime(data?.avgTimeSpentSeconds ?? 0)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Per session</span>
          </div>
        </div>

        {/* Today's Visitors */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Visitors
            </span>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-foreground">
              {loading ? "..." : data?.todayVisitors ?? 0}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-semibold">
              Active today
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Top Pages & Device Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Visited Pages (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <h3 className="font-serif text-lg font-bold text-foreground">Most Visited Pages</h3>
            </div>
            <span className="text-xs text-muted-foreground">Views & Avg Duration</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading top pages...</div>
            ) : !data?.topPages || data.topPages.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No visitor traffic recorded yet. Visit any page on the site to see analytics!
              </div>
            ) : (
              data.topPages.map((page, idx) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-sm font-semibold text-foreground truncate max-w-[280px] sm:max-w-[400px]">
                      {page.path}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-foreground">{page.views}</span>{" "}
                      <span className="text-muted-foreground">views</span>
                    </div>
                    <div className="rounded-lg bg-background px-2.5 py-1 text-muted-foreground font-medium border border-border">
                      ⏱ {formatTime(page.avgTimeSeconds)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Monitor className="size-5 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Device Distribution</h3>
          </div>

          <div className="space-y-4">
            {/* Desktop */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Monitor className="size-3.5 text-primary" /> Desktop Browsers
                </span>
                <span className="text-primary font-bold">{data?.deviceBreakdown.desktopPercent ?? 50}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${data?.deviceBreakdown.desktopPercent ?? 50}%` }}
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Smartphone className="size-3.5 text-amber-500" /> Mobile Devices
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  {data?.deviceBreakdown.mobilePercent ?? 50}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${data?.deviceBreakdown.mobilePercent ?? 50}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground leading-relaxed">
            <p className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
              <ShieldCheck className="size-4 text-emerald-500" /> Privacy-First Analytics
            </p>
            Analytics are processed securely on server without cookies or personal data tracking.
          </div>
        </div>
      </div>

      {/* Live Recent Visitor Sessions Log Table */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Recent Visitor Activity Log</h3>
          </div>
          <span className="text-xs text-muted-foreground">Last 15 visitor hits</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Session ID</th>
                <th className="py-3 px-3">Page Path</th>
                <th className="py-3 px-3">Device</th>
                <th className="py-3 px-3">Referrer</th>
                <th className="py-3 px-3">Time Spent</th>
                <th className="py-3 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading visitor activity log...
                  </td>
                </tr>
              ) : !data?.recentVisitors || data.recentVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No recent visitor sessions logged yet.
                  </td>
                </tr>
              ) : (
                data.recentVisitors.map((ev, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-foreground">{ev.sessionId}</td>
                    <td className="py-3 px-3 font-mono text-primary font-semibold">{ev.path}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          ev.device === "Mobile"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {ev.device === "Mobile" ? <Smartphone className="size-3" /> : <Monitor className="size-3" />}
                        {ev.device}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{ev.referrer}</td>
                    <td className="py-3 px-3 font-bold text-foreground">{formatTime(ev.durationSeconds)}</td>
                    <td className="py-3 px-3 text-muted-foreground">{formatTimestamp(ev.timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
