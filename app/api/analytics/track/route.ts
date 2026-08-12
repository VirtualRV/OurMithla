import { NextResponse } from "next/server"
import { trackSessionEvent } from "@/lib/analytics"
import { resolveVisitorLocation } from "@/lib/geo-from-request"
import type { CustomerDetails, DeviceDetails, DeviceKind, VisitorLocation } from "@/lib/analytics-types"

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown> = {}
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      body = (await request.json()) as Record<string, unknown>
    } else {
      const text = await request.text()
      try {
        body = JSON.parse(text) as Record<string, unknown>
      } catch {
        body = {}
      }
    }

    if (!body.sessionId || !body.path) {
      return NextResponse.json({ error: "sessionId and path required" }, { status: 400 })
    }

    const deviceRaw = String(body.device || "Desktop")
    const device: DeviceKind =
      deviceRaw === "Mobile" || deviceRaw === "Tablet" ? deviceRaw : "Desktop"

    const clientLoc = (body.location || null) as Partial<VisitorLocation> | null
    const location = await resolveVisitorLocation(request.headers, clientLoc)

    const deviceDetails = body.deviceDetails as DeviceDetails | undefined
    const customer = body.customer as CustomerDetails | undefined

    await trackSessionEvent({
      sessionId: String(body.sessionId),
      path: String(body.path),
      pageName: body.pageName ? String(body.pageName) : undefined,
      referrer: body.referrer ? String(body.referrer) : undefined,
      device,
      deviceDetails,
      location,
      customer:
        customer && (customer.name || customer.email || customer.phone)
          ? {
              name: customer.name ? String(customer.name).slice(0, 80) : undefined,
              email: customer.email ? String(customer.email).slice(0, 120) : undefined,
              phone: customer.phone ? String(customer.phone).slice(0, 40) : undefined,
              source: customer.source,
            }
          : undefined,
      durationSeconds: Number(body.durationSeconds) || 1,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
