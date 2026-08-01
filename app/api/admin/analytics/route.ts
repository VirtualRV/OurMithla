import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAnalyticsSummary } from "@/lib/analytics"

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")
  return token?.value === "authenticated"
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const summary = await getAnalyticsSummary()
    return NextResponse.json(summary)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
