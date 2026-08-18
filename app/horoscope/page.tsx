import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSettings } from "@/lib/settings"
import { HoroscopeView } from "@/components/horoscope/horoscope-view"

export const metadata: Metadata = {
  title: "Today’s Mithila Horoscope by Rashi",
  description:
    "Daily Vedic horoscope for Mithila — love, career, health, wealth, and spiritual guidance aligned with today’s Maithili Panchang.",
  alternates: { canonical: "https://ourmithla.com/horoscope" },
}

export default async function HoroscopePage() {
  const settings = await getSettings()
  if (!settings.enableHoroscope) {
    redirect("/")
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <p className="font-serif text-sm uppercase tracking-[0.2em] text-primary">OurMithla</p>
        <h1 className="mt-1 font-serif text-3xl text-foreground text-balance sm:text-4xl">
          Today&apos;s Horoscope
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Sidereal rashis matched to today&apos;s Panchang — guidance to build a balanced life.
        </p>
      </div>
      <HoroscopeView />
    </main>
  )
}
