"use client"

import { useEffect, useState } from "react"
import { BookOpen, Stars, Save, CheckCircle2, Orbit, Cpu } from "lucide-react"
import type { SiteSettings } from "@/lib/settings-defaults"
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults"
import { useSiteSettings } from "@/components/site-settings-provider"

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
  icon: Icon,
  compact,
}: {
  title: string
  description: string
  enabled: boolean
  onChange: (v: boolean) => void
  icon: React.ComponentType<{ className?: string }>
  compact?: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm sm:flex-row sm:items-center sm:justify-between ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ${
            compact ? "size-9" : "size-11"
          }`}
        >
          <Icon className={compact ? "size-4" : "size-5"} />
        </span>
        <div>
          <h3
            className={`font-serif font-bold text-foreground ${compact ? "text-base" : "text-lg"}`}
          >
            {title}
          </h3>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-1 size-6 rounded-full bg-card shadow transition-transform ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  )
}

export function FeatureSettingsPanel() {
  const { refresh } = useSiteSettings()
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings")
        if (res.ok) {
          setSettings({ ...DEFAULT_SETTINGS, ...(await res.json()) })
        }
      } catch {
        setError("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || "Save failed")
      }
      const updated = await res.json()
      setSettings({ ...DEFAULT_SETTINGS, ...updated })
      await refresh()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Loading feature settings…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Feature Controls</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Allow or disable public features. Changes apply site-wide after Save.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <ToggleRow
        icon={BookOpen}
        title="Public blog writing"
        description="When enabled, visitors can submit articles from /submit. Posts still need your approval before they go live."
        enabled={settings.allowPublicBlogSubmit}
        onChange={(v) => setSettings((s) => ({ ...s, allowPublicBlogSubmit: v }))}
      />

      <ToggleRow
        icon={Stars}
        title="Today's Horoscope"
        description="When enabled, visitors can check daily rashi guidance (love, career, health, wealth, spiritual) matched to today's Panchang."
        enabled={settings.enableHoroscope}
        onChange={(v) => setSettings((s) => ({ ...s, enableHoroscope: v }))}
      />

      <ToggleRow
        icon={Orbit}
        title="Birth Chart & Life Predictions"
        description="When enabled, visitors can generate a Janam Kundli from birth date/time/place. They can choose which calculation engine to use."
        enabled={settings.enableBirthChart}
        onChange={(v) => setSettings((s) => ({ ...s, enableBirthChart: v }))}
      />

      {settings.enableBirthChart && (
        <div className="space-y-3 rounded-2xl border border-border bg-secondary/30 p-4 sm:p-5">
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">Kundli engines</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Toggle which providers visitors may select. Hosted APIs also need keys in{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> — without keys
              they stay hidden even if enabled here.
            </p>
          </div>

          <ToggleRow
            compact
            icon={Cpu}
            title="Swiss Ephemeris (local)"
            description="Always available when enabled. No third-party key. Recommended default."
            enabled={settings.enableProviderSwiss}
            onChange={(v) => setSettings((s) => ({ ...s, enableProviderSwiss: v }))}
          />
          <ToggleRow
            compact
            icon={Cpu}
            title="Prokerala"
            description="Needs PROKERALA_CLIENT_ID + PROKERALA_CLIENT_SECRET."
            enabled={settings.enableProviderProkerala}
            onChange={(v) => setSettings((s) => ({ ...s, enableProviderProkerala: v }))}
          />
          <ToggleRow
            compact
            icon={Cpu}
            title="AstrologyAPI.com (VedicRishi)"
            description="Needs ASTROLOGYAPI_USER_ID + ASTROLOGYAPI_API_KEY."
            enabled={settings.enableProviderAstrologyApi}
            onChange={(v) => setSettings((s) => ({ ...s, enableProviderAstrologyApi: v }))}
          />
          <ToggleRow
            compact
            icon={Cpu}
            title="FreeAstroAPI"
            description="Needs FREEASTROAPI_KEY."
            enabled={settings.enableProviderFreeAstroApi}
            onChange={(v) => setSettings((s) => ({ ...s, enableProviderFreeAstroApi: v }))}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="size-4" /> Saved
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Save className="size-4" />
          )}
          Save settings
        </button>
      </div>
    </div>
  )
}
