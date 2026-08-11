"use client"

import { useEffect, useMemo, useState } from "react"
import { Heart, Briefcase, Activity, Coins, Sparkles, Star, Moon } from "lucide-react"
import { RASHIS, type RashiId, type DailyHoroscope } from "@/lib/horoscope"
import { LOCATIONS } from "@/lib/panchang"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"

type ApiResponse = {
  horoscope: DailyHoroscope
  panchang: {
    tithi: string
    nakshatra: string
    yoga: string
    moonRashi: string
    paksha: string
    festivals: string[]
  }
}

const AREA_ICONS = {
  love: Heart,
  career: Briefcase,
  health: Activity,
  finance: Coins,
  spiritual: Sparkles,
} as const

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Score ${score} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "size-2 rounded-full",
            i < score ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </div>
  )
}

export function HoroscopeView() {
  const { t } = useI18n()
  const [rashiId, setRashiId] = useState<RashiId>("mesha")
  const [locationId, setLocationId] = useState(LOCATIONS[0].id)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem("ourmithla.rashi") as RashiId | null
    if (saved && RASHIS.some((r) => r.id === saved)) {
      setRashiId(saved)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/horoscope?rashi=${rashiId}&location=${encodeURIComponent(locationId)}`,
          { cache: "no-store" },
        )
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Failed to load horoscope")
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [rashiId, locationId])

  const selected = useMemo(() => RASHIS.find((r) => r.id === rashiId)!, [rashiId])

  function selectRashi(id: RashiId) {
    setRashiId(id)
    window.localStorage.setItem("ourmithla.rashi", id)
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {t("horoscope.eyebrow")}
            </p>
            <h2 className="mt-1 font-serif text-xl text-foreground sm:text-2xl">
              {t("horoscope.chooseRashi")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("horoscope.chooseHint")}</p>
          </div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("horoscope.location")}
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium text-foreground sm:min-w-[200px]"
            >
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.city}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {RASHIS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => selectRashi(r.id)}
              className={cn(
                "rounded-xl border px-2 py-3 text-center transition-all",
                rashiId === r.id
                  ? "border-primary/40 bg-primary/10 shadow-sm"
                  : "border-border bg-secondary/40 hover:bg-muted",
              )}
            >
              <span className="block text-lg leading-none">{r.symbol}</span>
              <span className="mt-1.5 block font-serif text-sm font-semibold text-foreground">
                {r.name}
              </span>
              <span className="block text-[10px] text-muted-foreground">{r.nameHi}</span>
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {t("horoscope.loading")}
        </div>
      ) : data ? (
        <>
          <section className="rounded-2xl border border-primary/20 bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                  {selected.symbol}
                </span>
                <div>
                  <h2 className="font-serif text-2xl text-foreground">
                    {data.horoscope.rashi.name}{" "}
                    <span className="text-muted-foreground">· {data.horoscope.rashi.nameHi}</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {data.horoscope.rashi.element} · Lord {data.horoscope.rashi.lord} ·{" "}
                    {data.horoscope.dateISO}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Moon className="size-3.5 text-primary" />
                  {t("horoscope.moonToday")}: {data.panchang.moonRashi}
                </div>
                <p className="mt-1 text-muted-foreground">
                  {data.panchang.tithi} · {data.panchang.nakshatra}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-foreground/90 sm:text-base">
              {data.horoscope.overview}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t("horoscope.luckyColor")}
                </p>
                <p className="mt-0.5 font-serif text-lg text-foreground">{data.horoscope.luckyColor}</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t("horoscope.luckyNumber")}
                </p>
                <p className="mt-0.5 font-serif text-lg text-foreground">{data.horoscope.luckyNumber}</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t("horoscope.luckyTime")}
                </p>
                <p className="mt-0.5 font-serif text-lg text-foreground">{data.horoscope.luckyTime}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
            <h2 className="font-serif text-xl text-foreground sm:text-2xl">
              {t("horoscope.lifeTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("horoscope.lifeHint")}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {data.horoscope.areas.map((area) => {
                const Icon = AREA_ICONS[area.key]
                return (
                  <div
                    key={area.key}
                    className="rounded-xl border border-border bg-secondary/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </span>
                        <div>
                          <p className="font-serif text-base font-semibold text-foreground">
                            {area.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{area.labelHi}</p>
                        </div>
                      </div>
                      <ScoreDots score={area.score} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{area.advice}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Star className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <div>
                <h3 className="font-serif text-lg text-foreground">{t("horoscope.tipTitle")}</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">{data.horoscope.tip}</p>
              </div>
            </div>
          </section>

          <p className="px-2 text-center text-xs text-muted-foreground">
            {t("horoscope.disclaimer")}
          </p>
        </>
      ) : null}
    </div>
  )
}
