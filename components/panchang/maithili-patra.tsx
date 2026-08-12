'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { getMonthPatra, type PatraDay } from '@/lib/panchang'
import { cn } from '@/lib/utils'

const WEEKDAYS_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type MaithiliPatraProps = {
  date: Date
  locationId: string
  onSelectDate: (d: Date) => void
  /** Notified when calendar month changes (for synced shubh-din panel) */
  onMonthChange?: (year: number, month: number) => void
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function DayCell({
  day,
  selected,
  today,
  onSelect,
}: {
  day: PatraDay
  selected: boolean
  today: boolean
  onSelect: () => void
}) {
  const special =
    day.isPurnima || day.isAmavasya || day.isEkadashi || day.festivals.length > 0

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!day.inMonth}
      className={cn(
        'flex min-h-[5.5rem] flex-col gap-0.5 rounded-lg border p-1.5 text-left transition-colors sm:min-h-[6.5rem] sm:p-2',
        !day.inMonth && 'pointer-events-none border-transparent bg-transparent opacity-35',
        day.inMonth && 'border-border/70 bg-background hover:border-primary/40 hover:bg-primary/5',
        selected && day.inMonth && 'border-primary bg-primary/10 ring-2 ring-primary/25',
        today && day.inMonth && !selected && 'border-primary/50',
        day.isAmavasya && day.inMonth && 'bg-slate-900/5',
        day.isPurnima && day.inMonth && 'bg-amber-500/5',
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            'font-serif text-sm font-semibold sm:text-base',
            today && day.inMonth ? 'text-primary' : 'text-foreground',
          )}
        >
          {day.day}
        </span>
        {day.inMonth && (
          <span
            className={cn(
              'rounded px-1 py-px text-[9px] font-semibold uppercase tracking-wide',
              day.pakshaShort === 'Shukla'
                ? 'bg-amber-500/15 text-amber-800'
                : 'bg-indigo-500/15 text-indigo-800',
            )}
          >
            {day.pakshaShort === 'Shukla' ? 'शुक्ल' : 'कृष्ण'}
          </span>
        )}
      </div>

      {day.inMonth && (
        <>
          <p className="truncate text-[10px] font-medium leading-tight text-foreground/90 sm:text-[11px]">
            {day.tithiShort}
          </p>
          <p className="truncate text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
            {day.nakshatra}
          </p>
          {special && day.festivals[0] && (
            <p className="mt-auto line-clamp-2 text-[9px] font-medium leading-snug text-primary sm:text-[10px]">
              {day.festivals[0]}
            </p>
          )}
          {!day.festivals[0] && (day.isPurnima || day.isAmavasya || day.isEkadashi) && (
            <p className="mt-auto text-[9px] font-medium text-primary sm:text-[10px]">
              {day.isPurnima ? 'पूर्णिमा' : day.isAmavasya ? 'अमावस्या' : 'एकादशी'}
            </p>
          )}
        </>
      )}
    </button>
  )
}

export function MaithiliPatra({ date, locationId, onSelectDate, onMonthChange }: MaithiliPatraProps) {
  const [viewYear, setViewYear] = useState(date.getFullYear())
  const [viewMonth, setViewMonth] = useState(date.getMonth())

  useEffect(() => {
    setViewYear(date.getFullYear())
    setViewMonth(date.getMonth())
    onMonthChange?.(date.getFullYear(), date.getMonth())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from selected day only
  }, [date])

  const patra = useMemo(
    () => getMonthPatra(viewYear, viewMonth, locationId),
    [viewYear, viewMonth, locationId],
  )

  const today = useMemo(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), n.getDate())
  }, [])

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
    onMonthChange?.(d.getFullYear(), d.getMonth())
  }

  const [expandedDay, setExpandedDay] = useState<PatraDay | null>(null)

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-lg shadow-primary/5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <BookOpen className="size-3.5" />
            Maithili Patra
          </div>
          <h2 className="mt-1 font-serif text-xl text-foreground sm:text-2xl">
            Full Month Calendar
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Read tithi, nakshatra, and festivals for every day — like a Mithila wall patra.
            Tap a day to open its full panchang above.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-start">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-secondary hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-[9.5rem] text-center">
            <p className="font-serif text-base font-semibold text-foreground sm:text-lg">
              {patra.monthName}
            </p>
            <p className="text-[11px] text-muted-foreground">
              VS {patra.vikramSamvat} · {patra.hinduMonths.join(' / ')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-secondary hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS_EN.map((en, i) => (
          <div
            key={en}
            className="rounded-md bg-secondary/60 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs"
          >
            <span className="hidden sm:inline">{WEEKDAYS_HI[i]} · </span>
            {en}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {patra.weeks.flat().map((day) => {
          const key = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`
          return (
            <DayCell
              key={key}
              day={day}
              selected={isSameDay(day.date, date)}
              today={isSameDay(day.date, today)}
              onSelect={() => {
                onSelectDate(day.date)
                setExpandedDay(day)
              }}
            />
          )
        })}
      </div>

      {patra.festivalDays.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="font-serif text-base text-foreground sm:text-lg">
            This month&apos;s festivals & vrats
          </h3>
          <ul className="mt-3 space-y-2">
            {patra.festivalDays.map((d) => (
              <li key={d.date.toISOString()}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectDate(d.date)
                    setExpandedDay(d)
                  }}
                  className="flex w-full flex-col gap-0.5 rounded-xl border border-border/60 bg-secondary/30 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 sm:flex-row sm:items-baseline sm:gap-3"
                >
                  <span className="shrink-0 text-xs font-semibold text-primary sm:w-28">
                    {d.day} · {d.vaar.slice(0, 3)}
                  </span>
                  <span className="text-sm text-foreground">
                    <span className="text-muted-foreground">{d.tithiShort} · </span>
                    {d.festivals.join(' · ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {expandedDay && expandedDay.inMonth && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <p className="font-serif text-base font-semibold text-foreground">
            {expandedDay.day} {patra.monthName.split(' ')[0]} — {expandedDay.vaar}
          </p>
          <div className="mt-2 grid gap-1 text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="font-medium text-foreground">Tithi:</span> {expandedDay.tithiShort} (
              {expandedDay.pakshaShort})
            </p>
            <p>
              <span className="font-medium text-foreground">Nakshatra:</span> {expandedDay.nakshatra}
            </p>
            <p>
              <span className="font-medium text-foreground">Yoga:</span> {expandedDay.yoga}
            </p>
            <p>
              <span className="font-medium text-foreground">Karana:</span> {expandedDay.karana}
            </p>
            <p>
              <span className="font-medium text-foreground">Sunrise / Sunset:</span>{' '}
              {expandedDay.sunrise} – {expandedDay.sunset}
            </p>
            <p>
              <span className="font-medium text-foreground">Month:</span> {expandedDay.purnimanta}{' '}
              (Purnimanta)
            </p>
          </div>
          {expandedDay.festivals.length > 0 && (
            <p className="mt-2 text-foreground">
              <span className="font-medium">Festivals:</span> {expandedDay.festivals.join(' · ')}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
