import { CircleCheck, CircleAlert } from 'lucide-react'
import type { Timing } from '@/lib/panchang'

type Variant = 'auspicious' | 'inauspicious'

function TimingList({
  title,
  subtitle,
  timings,
  variant,
}: {
  title: string
  subtitle: string
  timings: Timing[]
  variant: Variant
}) {
  const isGood = variant === 'auspicious'

  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 shadow-lg sm:p-6 ${
        isGood
          ? 'border-auspicious/20 bg-auspicious-muted shadow-auspicious/5'
          : 'border-inauspicious/20 bg-inauspicious-muted shadow-inauspicious/5'
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-full ${
            isGood
              ? 'bg-auspicious text-auspicious-foreground'
              : 'bg-inauspicious text-inauspicious-foreground'
          }`}
        >
          {isGood ? (
            <CircleCheck className="size-5" />
          ) : (
            <CircleAlert className="size-5" />
          )}
        </div>
        <div>
          <h3 className="font-serif text-lg text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {timings.map((t) => (
          <li
            key={t.label}
            className="flex items-center justify-between gap-3 rounded-lg bg-card/70 px-3 py-2.5"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span
                className={`inline-block size-2 rounded-full ${
                  isGood ? 'bg-auspicious' : 'bg-inauspicious'
                }`}
                aria-hidden="true"
              />
              {t.label}
            </span>
            <span
              className={`text-sm font-semibold tabular-nums ${
                isGood ? 'text-auspicious' : 'text-inauspicious'
              }`}
            >
              {t.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Muhurat({
  auspicious,
  inauspicious,
}: {
  auspicious: Timing[]
  inauspicious: Timing[]
}) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TimingList
        title="Auspicious Timings"
        subtitle="Shubh Muhurat — favourable periods"
        timings={auspicious}
        variant="auspicious"
      />
      <TimingList
        title="Inauspicious Timings"
        subtitle="Ashubh Kaal — avoid new beginnings"
        timings={inauspicious}
        variant="inauspicious"
      />
    </section>
  )
}
