import { NextResponse } from 'next/server'
import { getPanchang, LOCATIONS } from '@/lib/panchang'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get('date')
  const locationId = searchParams.get('location') || 'darbhanga'

  let date = new Date()
  if (dateStr) {
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      date = parsed
    }
  }

  const validLocation = LOCATIONS.find((l) => l.id === locationId) || LOCATIONS[0]
  const panchang = getPanchang(date, validLocation.id)

  return NextResponse.json(
    {
      success: true,
      date: date.toISOString().slice(0, 10),
      location: validLocation,
      panchang,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    }
  )
}
