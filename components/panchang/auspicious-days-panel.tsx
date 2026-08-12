"use client"

import { useMemo, useState } from "react"
import {
  Sparkles,
  Heart,
  Scissors,
  Shirt,
  Baby,
  Home,
  Car,
  Star,
  ChevronRight,
} from "lucide-react"
import {
  CEREMONIES,
  findAuspiciousDaysInMonth,
  getCeremony,
  type AuspiciousDay,
  type CeremonyId,
} from "@/lib/auspicious-days"
import { cn } from "@/lib/utils"

const ICONS: Record<CeremonyId, React.ComponentType<{ className?: string }>> = {
  vivah: Heart,
  janeu: Shirt,
  mundan: Scissors,
  namkaran: Baby,
  annaprashan: Baby,
  grihaPravesh: Home,
  vehicle: Car,
  general: Star,
}

type Props = {
  year: number
  month: number
  locationId: string
  onSelectDate: (d: Date) => void
}

function GradeBadge({ grade }: { grade: AuspiciousDay["grade"] }) {
  const styles = {
    excellent: "bg-emerald-500/15 text-emerald-800",
    good: "bg-primary/15 text-primary",
    fair: "bg-amber-500/15 text-amber-800",
    avoid: "bg-destructive/10 text-destructive",
  }
  const labels = {
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    avoid: "Avoid",
  }
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", styles[grade])}>
      {labels[grade]}
    </span>
  )
}

export function AuspiciousDaysPanel({ year, month, locationId, onSelectDate }: Props) {
  const [ceremony, setCeremony] = useState<CeremonyId>("vivah")
  const [expanded, setExpanded] = useState<string | null>(null)

  const info = getCeremony(ceremony)
  const Icon = ICONS[ceremony]

  const days = useMemo(
    () => findAuspiciousDaysInMonth(year, month, locationId, ceremony, { minScore: 58, limit: 10 }),
    [year, month, locationId, ceremony],
  )

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-lg shadow-primary/5 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="size-3.5" />
          Shubh Din · Maithili Patra
        </div>
        <h2 className="mt-1 font-serif text-xl text-foreground sm:text-2xl">
          Auspicious days this month
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Find good days for Vivah (marriage), Janeu, Mundan (Muran), Namkaran, Annaprashan, Griha
          Pravesh and more — based on tithi, nakshatra, yoga & karana for {monthLabel}.
        </p>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {CEREMONIES.map((c) => {
          const CIcon = ICONS[c.id]
          const active = ceremony === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCeremony(c.id)
                setExpanded(null)
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/40",
              )}
            >
              <CIcon className="size-3.5" />
              {c.labelMai.split(" / ")[0]}
            </button>
          )
        })}
      </div>

      <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="font-serif text-base font-semibold text-foreground">
            {info.label} · {info.labelHi}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{info.description}</p>
        </div>
      </div>

      {days.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          No strongly favourable days found this month for {info.labelMai}. Try next month, or ask a
          local purohit for lagna-based muhurat.
        </p>
      ) : (
        <ul className="space-y-2">
          {days.map((d) => {
            const key = d.date.toISOString()
            const open = expanded === key
            return (
              <li key={key} className="rounded-xl border border-border/70 bg-secondary/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : key)}
                  className="flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-primary/5"
                >
                  <div className="min-w-[4.5rem] shrink-0">
                    <p className="font-serif text-lg font-semibold text-foreground">
                      {d.date.getDate()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{d.weekday.slice(0, 3)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{d.dateLabel}</p>
                      <GradeBadge grade={d.grade} />
                      <span className="text-[11px] font-bold text-primary">{d.score}/100</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {d.tithi} · {d.nakshatra}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      open && "rotate-90",
                    )}
                  />
                </button>

                {open && (
                  <div className="space-y-3 border-t border-border bg-card px-3.5 py-3.5 text-sm">
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      <p>
                        <span className="text-muted-foreground">Tithi:</span> {d.tithi}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Nakshatra:</span> {d.nakshatra}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Yoga:</span> {d.yoga}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Karana:</span> {d.karana}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Month:</span> {d.purnimanta}{" "}
                        (Purnimanta)
                      </p>
                      <p>
                        <span className="text-muted-foreground">Window:</span> {d.suggestedWindow}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {d.reasons.map((r, i) => (
                        <p
                          key={i}
                          className={cn(
                            "text-xs",
                            r.kind === "pro" ? "text-emerald-800" : "text-amber-800",
                          )}
                        >
                          {r.kind === "pro" ? "+" : "!"} {r.text}
                        </p>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectDate(d.date)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      Open full panchang for this day
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Scores follow classical muhurat hints (tithi, nakshatra, yoga, karana, Chaturmas). Exact
        vivah / janeu lagna windows need a local purohit. This is guidance from OurMithla Maithili
        Patra — not a substitute for personal kundli matching.
      </p>
    </section>
  )
}
