import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSettings, updateSettings } from "@/lib/settings"

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")
  return token?.value === "authenticated"
}

function boolOrUndef(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const updated = await updateSettings({
      allowPublicBlogSubmit: boolOrUndef(body.allowPublicBlogSubmit),
      enableHoroscope: boolOrUndef(body.enableHoroscope),
      enableBirthChart: boolOrUndef(body.enableBirthChart),
      enableProviderSwiss: boolOrUndef(body.enableProviderSwiss),
      enableProviderProkerala: boolOrUndef(body.enableProviderProkerala),
      enableProviderAstrologyApi: boolOrUndef(body.enableProviderAstrologyApi),
      enableProviderFreeAstroApi: boolOrUndef(body.enableProviderFreeAstroApi),
    })
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
