import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSettings } from "@/lib/settings"
import { BirthChartView } from "@/components/kundli/birth-chart-view"

export const metadata: Metadata = {
  title: "Mithila Janam Kundli & Birth Chart",
  description:
    "Generate a Vedic Janam Kundli in the Mithila tradition — Lagna, planets, houses, and life guidance for career, relationships, wealth, and dharma.",
  alternates: { canonical: "https://ourmithla.com/kundli" },
}

export default async function KundliPage() {
  const settings = await getSettings()
  if (!settings.enableBirthChart) {
    redirect("/")
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <p className="font-serif text-sm uppercase tracking-[0.2em] text-primary">OurMithla</p>
        <h1 className="mt-1 font-serif text-3xl text-foreground text-balance sm:text-4xl">
          Birth Chart &amp; Life Path
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          Enter birth details to see your Janam Kundli — Lagna, planets, houses, and life predictions
          aligned with OurMithla&apos;s sidereal Panchang.
        </p>
      </div>
      <BirthChartView />
    </main>
  )
}
