"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
  ShieldCheck,
  MapPin,
  Tablet,
  UserRound,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"
import type { AnalyticsSummary } from "@/lib/analytics-types"

type Props = {
  /** Show back link + page chrome for standalone /admin/analytics */
  fullPage?: boolean
}

export function AnalyticsDashboard({ fullPage = false }: Props) {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAnalytics() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/analytics")
      if (!res.ok) throw new Error("Failed to load analytics")
      setData(await res.json())
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAnalytics()
    const t = setInterval(() => void fetchAnalytics(), 30000)
    return () => clearInterval(t)
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
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {fullPage && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Back to Admin
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            View site <ExternalLink className="size-3.5" />
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Traffic & Visitor Analytics
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              <span className="size-1.5 animate-ping rounded-full bg-emerald-500" /> Live
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Page names, device details, visitor location, and known customer info when available.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!fullPage && (
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10"
            >
              <ExternalLink className="size-3.5" /> Full analytics view
            </Link>
          )}
          <button
            type="button"
            onClick={() => void fetchAnalytics()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground shadow-xs hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: "Total Visitors",
            value: data?.totalVisitors ?? 0,
            hint: "Unique sessions",
            icon: Users,
            tone: "text-primary bg-primary/10",
          },
          {
            label: "Pageviews",
            value: data?.totalPageviews ?? 0,
            hint: "All hits",
            icon: Eye,
            tone: "text-amber-600 bg-amber-500/10",
          },
          {
            label: "Avg Time",
            value: formatTime(data?.avgTimeSpentSeconds ?? 0),
            hint: "Per session",
            icon: Clock,
            tone: "text-emerald-600 bg-emerald-500/10",
          },
          {
            label: "Today",
            value: data?.todayVisitors ?? 0,
            hint: "Active today",
            icon: TrendingUp,
            tone: "text-sky-600 bg-sky-500/10",
          },
          {
            label: "Known customers",
            value: data?.customersSeen ?? 0,
            hint: "Name / email saved",
            icon: UserRound,
            tone: "text-violet-600 bg-violet-500/10",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {kpi.label}
              </span>
              <div className={`flex size-9 items-center justify-center rounded-2xl ${kpi.tone}`}>
                <kpi.icon className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-foreground">
                {loading ? "…" : kpi.value}
              </span>
              <span className="text-[11px] text-muted-foreground">{kpi.hint}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <h3 className="font-serif text-lg font-bold text-foreground">Most visited pages</h3>
            </div>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : !data?.topPages?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No traffic yet. Browse the site to populate analytics.
              </p>
            ) : (
              data.topPages.map((page, idx) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {page.pageName || page.path}
                      </p>
                      <p className="truncate font-mono text-[11px] text-muted-foreground">{page.path}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <p className="font-bold text-foreground">{page.views} views</p>
                    <p className="text-muted-foreground">{formatTime(page.avgTimeSeconds)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Monitor className="size-5 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Devices</h3>
          </div>
          {[
            {
              label: "Desktop",
              pct: data?.deviceBreakdown.desktopPercent ?? 0,
              icon: Monitor,
              color: "bg-primary",
            },
            {
              label: "Mobile",
              pct: data?.deviceBreakdown.mobilePercent ?? 0,
              icon: Smartphone,
              color: "bg-amber-500",
            },
            {
              label: "Tablet",
              pct: data?.deviceBreakdown.tabletPercent ?? 0,
              icon: Tablet,
              color: "bg-sky-500",
            },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <row.icon className="size-3.5" /> {row.label}
                </span>
                <span>{row.pct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <p className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-emerald-500" /> Privacy note
            </p>
            Location uses device GPS (if allowed) or IP/timezone. Customer name/email only appears after
            they use Contact or Submit.
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <MapPin className="size-5 text-primary" />
          <h3 className="font-serif text-lg font-bold text-foreground">Top locations</h3>
        </div>
        {!data?.topLocations?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Locations will appear after visitors load pages (IP / device / timezone).
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.topLocations.map((loc) => (
              <div
                key={loc.label}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{loc.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[loc.city, loc.region, loc.country].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-primary">{loc.visits}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Recent visitor activity</h3>
          </div>
          <span className="text-xs text-muted-foreground">Latest hits</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead>
              <tr className="border-b border-border font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3">When</th>
                <th className="px-3 py-3">Page</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Device</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : !data?.recentVisitors?.length ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No sessions yet.
                  </td>
                </tr>
              ) : (
                data.recentVisitors.map((ev, i) => (
                  <tr key={`${ev.sessionId}-${ev.path}-${i}`} className="hover:bg-muted/30">
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                      {formatTimestamp(ev.timestamp)}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-foreground">{ev.pageName || ev.path}</p>
                      <p className="font-mono text-[11px] text-primary">{ev.path}</p>
                      <p className="text-[11px] text-muted-foreground">via {ev.referrer}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-foreground">{ev.location?.label || "—"}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {ev.location?.timeZone || ev.deviceDetails?.timeZone || ""}
                        {ev.location?.source ? ` · ${ev.location.source}` : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-medium">
                        {ev.device === "Mobile" ? (
                          <Smartphone className="size-3" />
                        ) : ev.device === "Tablet" ? (
                          <Tablet className="size-3" />
                        ) : (
                          <Monitor className="size-3" />
                        )}
                        {ev.device}
                      </span>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {[ev.deviceDetails?.os, ev.deviceDetails?.browser, ev.deviceDetails?.screen]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      {ev.customer?.name || ev.customer?.email ? (
                        <>
                          <p className="font-medium text-foreground">{ev.customer.name || "—"}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {ev.customer.email || ev.customer.phone || ""}
                          </p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Guest</span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-bold text-foreground">
                      {formatTime(ev.durationSeconds)}
                    </td>
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
