import { NextResponse } from "next/server"
import { getSettings } from "@/lib/settings"

/** Public site feature flags (safe to expose). */
export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings)
}
