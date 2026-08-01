import { NextResponse } from "next/server"
import { trackSessionEvent } from "@/lib/analytics"

export async function POST(request: Request) {
  try {
    let body: any = {}
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      body = await request.json()
    } else {
      const text = await request.text()
      try {
        body = JSON.parse(text)
      } catch {
        body = {}
      }
    }

    if (!body.sessionId || !body.path) {
      return NextResponse.json({ error: "sessionId and path required" }, { status: 400 })
    }

    await trackSessionEvent({
      sessionId: String(body.sessionId),
      path: String(body.path),
      referrer: body.referrer ? String(body.referrer) : undefined,
      device: body.device === "Mobile" ? "Mobile" : "Desktop",
      durationSeconds: Number(body.durationSeconds) || 1,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
