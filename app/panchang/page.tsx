"use client"

import { useMemo, useState } from "react"
import { getPanchang, LOCATIONS } from "@/lib/panchang"
import { DateHeader } from "@/components/panchang/date-header"
import { MainDetails } from "@/components/panchang/main-details"
import { SunMoon } from "@/components/panchang/sun-moon"
import { Muhurat } from "@/components/panchang/muhurat"
import { MonthInfo } from "@/components/panchang/month-info"
import { UpcomingEventsBanner } from "@/components/panchang/upcoming-events-banner"
import { AdSlot } from "@/components/ad-slot"
import { useI18n } from "@/components/i18n-provider"

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export default function PanchangPage() {
  const { t } = useI18n()
  const [date, setDate] = useState<Date>(() => startOfDay(new Date()))
  const [locationId, setLocationId] = useState<string>(LOCATIONS[0].id)

  const panchang = useMemo(() => getPanchang(date, locationId), [date, locationId])
  const location = LOCATIONS.find((l) => l.id === locationId) ?? LOCATIONS[0]

  const shiftDay = (delta: number) => {
    setDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + delta)
      return startOfDay(next)
    })
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <p className="font-serif text-sm uppercase tracking-[0.2em] text-primary">OurMithla</p>
        <h1 className="mt-1 font-serif text-3xl text-foreground text-balance sm:text-4xl">
          {t("panchang.pageTitle")}
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        <DateHeader
          date={date}
          locationId={locationId}
          onPrev={() => shiftDay(-1)}
          onNext={() => shiftDay(1)}
          onToday={() => setDate(startOfDay(new Date()))}
          onLocationChange={setLocationId}
        />

        <MainDetails panchang={panchang} />

        <SunMoon panchang={panchang} />

        <UpcomingEventsBanner date={date} locationId={locationId} />

        <AdSlot variant="leaderboard" slot="panchang-mid" />

        <Muhurat auspicious={panchang.auspicious} inauspicious={panchang.inauspicious} />

        <MonthInfo panchang={panchang} />

        <p className="px-2 pt-2 text-center text-xs text-muted-foreground text-pretty">
          Timings shown are illustrative and localised for {location.city}. For rituals and
          important muhurats, please confirm with a qualified panchang or local purohit.
        </p>
      </div>
    </main>
  )
}
