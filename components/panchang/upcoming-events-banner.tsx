"use client"

import { getUpcomingEvents } from "@/lib/panchang"
import { CalendarDays, Sparkles, Clock, UtensilsCrossed } from "lucide-react"

type Props = {
  date: Date
  locationId: string
}

export function UpcomingEventsBanner({ date, locationId }: Props) {
  const events = getUpcomingEvents(date, locationId, 4)

  return (
    <div className="rounded-3xl border border-primary/20 bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground sm:text-2xl">
              Upcoming Vrats & Festivals
            </h2>
            <p className="text-xs text-muted-foreground font-serif">आगामी व्रत एवं त्योहार</p>
          </div>
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
          <Sparkles className="size-3.5" />
          Mithila Almanac
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((evt, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-between rounded-2xl border p-4 transition-all hover:shadow-md ${
              idx === 0
                ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20"
                : "border-border bg-muted/30"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    idx === 0
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <Clock className="size-3" />
                  {evt.daysAwayText}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {evt.dayName}, {evt.dateFormatted}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                {evt.festivals.map((fest, fIdx) => (
                  <p key={fIdx} className="font-serif text-sm font-bold text-foreground leading-snug">
                    {fest}
                  </p>
                ))}
              </div>

              {evt.fastingNote && (
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {evt.fastingNote}
                </p>
              )}
            </div>

            <div className="mt-3 border-t border-border/50 pt-2 text-[11px] font-medium text-muted-foreground/80 truncate">
              {evt.tithiName}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
