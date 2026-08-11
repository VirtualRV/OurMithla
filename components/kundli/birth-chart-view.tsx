"use client"

import { useEffect, useState } from "react"
import {
  Sparkles,
  User,
  Calendar,
  Clock,
  Heart,
  Briefcase,
  Coins,
  Activity,
  Home,
  Stars,
  Timer,
  Flower2,
  Cpu,
} from "lucide-react"
import { BIRTH_PLACE_PRESETS, type BirthChart, type BirthPlace } from "@/lib/birth-chart-types"
import type { AstrologyProviderId } from "@/lib/astrology-providers/catalog"
import { PlaceSearch } from "@/components/place-search"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"

type ProviderOption = {
  id: AstrologyProviderId
  label: string
  shortLabel: string
  description: string
  features: string[]
  available: boolean
  configured: boolean
  enabled: boolean
}

const PRED_ICONS = {
  personality: User,
  career: Briefcase,
  wealth: Coins,
  relationships: Heart,
  health: Activity,
  family: Home,
  spiritual: Stars,
  timing: Timer,
} as const

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn("size-2 rounded-full", i < score ? "bg-primary" : "bg-border")}
        />
      ))}
    </div>
  )
}

export function BirthChartView() {
  const { t } = useI18n()
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("1995-01-15")
  const [birthTime, setBirthTime] = useState("10:30")
  const [place, setPlace] = useState<BirthPlace>(BIRTH_PLACE_PRESETS[0])
  const [provider, setProvider] = useState<AstrologyProviderId>("swiss")
  const [providers, setProviders] = useState<ProviderOption[]>([])
  const [chart, setChart] = useState<BirthChart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProviders() {
      try {
        const res = await fetch("/api/birth-chart", { cache: "no-store" })
        if (!res.ok) return
        const json = (await res.json()) as { providers?: ProviderOption[] }
        const list = (json.providers || []).filter((p) => p.available)
        setProviders(list)
        if (list.length && !list.some((p) => p.id === provider)) {
          setProvider(list[0].id)
        }
      } catch {
        // keep swiss default
      }
    }
    void loadProviders()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, [])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!place) {
      setError("Please select a birth place")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birthDate, birthTime, place, provider }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to generate chart")
      setChart(json.chart as BirthChart)
    } catch (err) {
      setError((err as Error).message)
      setChart(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleGenerate}
        className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6"
      >
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t("kundli.eyebrow")}
          </p>
          <h2 className="mt-1 font-serif text-xl text-foreground sm:text-2xl">
            {t("kundli.formTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("kundli.formHint")}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="size-3.5 text-primary" /> {t("kundli.name")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("kundli.namePlaceholder")}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <PlaceSearch value={place} onChange={setPlace} label={t("kundli.place")} />
          <div className="sm:col-span-2">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Cpu className="size-3.5 text-primary" /> Calculation engine
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {(providers.length
                ? providers
                : [
                    {
                      id: "swiss" as const,
                      shortLabel: "Swiss Ephemeris",
                      label: "Swiss Ephemeris (Local)",
                      description: "Local Lahiri calculation",
                      features: [],
                      available: true,
                      configured: true,
                      enabled: true,
                    },
                  ]
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={cn(
                    "rounded-xl border px-3.5 py-3 text-left transition-colors",
                    provider === p.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-background hover:border-primary/40",
                  )}
                >
                  <p className="text-sm font-semibold text-foreground">{p.shortLabel}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
            {providers.length > 0 && providers.length < 4 && (
              <p className="mt-2 text-xs text-muted-foreground">
                More engines appear here when their API keys are set in{" "}
                <code className="rounded bg-muted px-1">.env</code> and enabled in Admin → Features.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="size-3.5 text-primary" /> {t("kundli.date")} *
            </label>
            <input
              required
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3.5 text-primary" /> {t("kundli.time")} *
            </label>
            <input
              required
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {loading ? t("kundli.generating") : t("kundli.generate")}
          </button>
        </div>
      </form>

      {chart && (
        <>
          <section className="rounded-2xl border border-primary/20 bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {t("kundli.resultEyebrow")}
                </p>
                <h2 className="mt-1 font-serif text-2xl text-foreground">{chart.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {chart.birthDate} · {chart.birthTime} · {chart.place.city}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-xs text-muted-foreground">
                <div>{chart.providerLabel || chart.engine}</div>
                {chart.ayanamsha > 0 && (
                  <div className="mt-0.5">Ayanāṃśa {chart.ayanamsha.toFixed(4)}°</div>
                )}
                {chart.place.timeZoneId && (
                  <div className="mt-0.5 font-medium text-foreground/80">{chart.place.timeZoneId}</div>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t("kundli.lagna"), value: `${chart.lagna.symbol} ${chart.lagna.name}`, sub: `${chart.lagna.nameHi} · ${chart.lagnaDegree}°` },
                { label: t("kundli.moon"), value: `${chart.moonRashi.symbol} ${chart.moonRashi.name}`, sub: chart.moonRashi.nameHi },
                { label: t("kundli.sun"), value: `${chart.sunRashi.symbol} ${chart.sunRashi.name}`, sub: chart.sunRashi.nameHi },
                {
                  label: t("kundli.nakshatra"),
                  value: chart.nakshatra,
                  sub: `Pada ${chart.nakshatraPada}`,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="mt-0.5 font-serif text-lg text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-foreground/90 sm:text-base">{chart.overview}</p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
            <h2 className="font-serif text-xl text-foreground sm:text-2xl">{t("kundli.planetsTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("kundli.planetsHint")}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Planet</th>
                    <th className="px-3 py-2">Rashi</th>
                    <th className="px-3 py-2">Degree</th>
                    <th className="px-3 py-2">House</th>
                    <th className="px-3 py-2">Dignity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {chart.planets.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20">
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {p.id} <span className="text-muted-foreground">({p.nameHi})</span>
                      </td>
                      <td className="px-3 py-2.5">
                        {p.rashi.symbol} {p.rashi.name}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">{p.degreeInRashi}°</td>
                      <td className="px-3 py-2.5">{p.house}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {p.dignity}
                        {p.retrograde ? " · R" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
            <h2 className="font-serif text-xl text-foreground sm:text-2xl">{t("kundli.housesTitle")}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chart.houses.map((h) => (
                <div key={h.number} className="rounded-xl border border-border bg-secondary/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-serif text-base font-semibold text-foreground">
                      House {h.number} · {h.rashi.symbol} {h.rashi.name}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Lord {h.lord}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{h.themes}</p>
                  {h.planets.length > 0 && (
                    <p className="mt-2 text-xs font-medium text-primary">
                      {h.planets.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {chart.predictions.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
            <h2 className="font-serif text-xl text-foreground sm:text-2xl">{t("kundli.lifeTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("kundli.lifeHint")}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {chart.predictions.map((pred) => {
                const Icon = PRED_ICONS[pred.key]
                return (
                  <div key={pred.key} className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </span>
                        <div>
                          <p className="font-serif text-base font-semibold text-foreground">{pred.title}</p>
                          <p className="text-[11px] text-muted-foreground">{pred.titleHi}</p>
                        </div>
                      </div>
                      <ScoreDots score={pred.score} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pred.summary}</p>
                    <div className="mt-3 space-y-1">
                      {pred.strengths.map((s) => (
                        <p key={s} className="text-xs text-foreground/90">
                          <span className="font-semibold text-emerald-700">+</span> {s}
                        </p>
                      ))}
                      {pred.watchouts.map((w) => (
                        <p key={w} className="text-xs text-foreground/80">
                          <span className="font-semibold text-amber-700">!</span> {w}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
          )}

          {chart.remedies.length > 0 && (
          <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Flower2 className="mt-0.5 size-5 shrink-0 text-amber-700" />
              <div>
                <h3 className="font-serif text-lg text-foreground">{t("kundli.remediesTitle")}</h3>
                <ul className="mt-2 space-y-2">
                  {chart.remedies.map((r) => (
                    <li key={r} className="text-sm leading-relaxed text-foreground/90">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          )}

          <p className="px-2 text-center text-xs text-muted-foreground">{chart.disclaimer}</p>
        </>
      )}
    </div>
  )
}
