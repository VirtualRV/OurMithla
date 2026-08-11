import { NextResponse } from "next/server"
import { getPanchang, LOCATIONS } from "@/lib/panchang"
import { getDailyHoroscope, getRashiById, type RashiId } from "@/lib/horoscope"
import { getSettings } from "@/lib/settings"

export async function GET(request: Request) {
  const settings = await getSettings()
  if (!settings.enableHoroscope) {
    return NextResponse.json({ error: "Horoscope is currently disabled" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const rashiParam = (searchParams.get("rashi") || "mesha").toLowerCase()
  const locationId = searchParams.get("location") || LOCATIONS[0].id

  if (!getRashiById(rashiParam)) {
    return NextResponse.json({ error: "Invalid rashi" }, { status: 400 })
  }

  const today = new Date()
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const panchang = getPanchang(date, locationId)
  const horoscope = getDailyHoroscope(date, rashiParam as RashiId, panchang.moonRashiIndex)

  return NextResponse.json({
    horoscope,
    panchang: {
      tithi: panchang.tithi.value,
      nakshatra: panchang.nakshatra.value,
      yoga: panchang.yoga.value,
      moonRashi: panchang.moonRashi,
      paksha: panchang.paksha,
      festivals: panchang.festivals,
    },
  })
}
