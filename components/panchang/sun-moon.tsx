import { Sunrise, Sunset, MoonStar, Moon } from 'lucide-react'
import type { Panchang } from '@/lib/panchang'

type Item = {
  label: string
  time: string
  icon: React.ReactNode
}

export function SunMoon({ panchang }: { panchang: Panchang }) {
  const items: Item[] = [
    {
      label: 'Sunrise',
      time: panchang.sunrise,
      icon: <Sunrise className="size-6 text-primary" />,
    },
    {
      label: 'Sunset',
      time: panchang.sunset,
      icon: <Sunset className="size-6 text-primary" />,
    },
    {
      label: 'Moonrise',
      time: panchang.moonrise,
      icon: <MoonStar className="size-6 text-gold" />,
    },
    {
      label: 'Moonset',
      time: panchang.moonset,
      icon: <Moon className="size-6 text-gold" />,
    },
  ]

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
      <h2 className="mb-4 font-serif text-xl text-foreground sm:text-2xl">
        Sun &amp; Moon
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-secondary/40 p-4 text-center"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-card shadow-sm">
              {item.icon}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {item.label}
            </span>
            <span className="font-serif text-lg text-foreground">{item.time}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
