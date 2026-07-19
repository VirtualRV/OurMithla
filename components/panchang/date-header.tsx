'use client'

import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from 'lucide-react'
import { LOCATIONS } from '@/lib/panchang'

type DateHeaderProps = {
  date: Date
  locationId: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onLocationChange: (id: string) => void
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function DateHeader({
  date,
  locationId,
  onPrev,
  onNext,
  onToday,
  onLocationChange,
}: DateHeaderProps) {
  const today = isSameDay(date, new Date())

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-lg shadow-primary/5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Date navigator */}
        <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-4">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous day"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="flex min-w-0 flex-col items-center text-center">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <CalendarDays className="size-4" />
              <span>{WEEKDAYS[date.getDay()]}</span>
            </div>
            <h1 className="font-serif text-2xl leading-tight text-foreground sm:text-3xl">
              {date.getDate()} {MONTHS[date.getMonth()]} {date.getFullYear()}
            </h1>
          </div>

          <button
            type="button"
            onClick={onNext}
            aria-label="Next day"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToday}
            disabled={today}
            className="rounded-full border border-primary/40 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-primary"
          >
            Today
          </button>

          <div className="relative flex-1 sm:flex-none">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
            <label htmlFor="location-select" className="sr-only">
              Select location
            </label>
            <select
              id="location-select"
              value={locationId}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full appearance-none rounded-full border border-border bg-secondary py-2.5 pl-9 pr-9 text-sm font-medium text-secondary-foreground transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-56"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.city}, {loc.region.split(',')[0]}
                </option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 rotate-90 text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  )
}
