import "server-only"
import type { VisitorLocation } from "@/lib/analytics-types"

function firstHeader(headers: Headers, name: string): string | undefined {
  const v = headers.get(name)
  return v?.split(",")[0]?.trim() || undefined
}

export function getClientIp(headers: Headers): string | undefined {
  return (
    firstHeader(headers, "x-forwarded-for") ||
    firstHeader(headers, "x-real-ip") ||
    firstHeader(headers, "cf-connecting-ip") ||
    undefined
  )
}

/** Prefer platform geo headers (Vercel / Cloudflare), then optional IP lookup. */
export async function resolveVisitorLocation(
  headers: Headers,
  clientHint?: Partial<VisitorLocation> | null,
): Promise<VisitorLocation> {
  if (
    clientHint &&
    (clientHint.city ||
      clientHint.country ||
      (typeof clientHint.latitude === "number" && typeof clientHint.longitude === "number"))
  ) {
    const label = [
      clientHint.city,
      clientHint.region,
      clientHint.country || clientHint.countryCode,
    ]
      .filter(Boolean)
      .join(", ")
    return {
      source: clientHint.source || "device",
      city: clientHint.city,
      region: clientHint.region,
      country: clientHint.country,
      countryCode: clientHint.countryCode,
      latitude: clientHint.latitude,
      longitude: clientHint.longitude,
      timeZone: clientHint.timeZone,
      label: label || clientHint.label || "Device location",
    }
  }

  const city =
    firstHeader(headers, "x-vercel-ip-city") ||
    firstHeader(headers, "cf-ipcity")
  const region =
    firstHeader(headers, "x-vercel-ip-country-region") ||
    firstHeader(headers, "cf-region")
  const countryCode =
    firstHeader(headers, "x-vercel-ip-country") ||
    firstHeader(headers, "cf-ipcountry")
  const ip = getClientIp(headers)

  if (city || countryCode) {
    const label = [city, region, countryCode].filter(Boolean).join(", ")
    return {
      source: "ip",
      city: city ? decodeURIComponent(city) : undefined,
      region,
      country: countryCode,
      countryCode,
      timeZone: clientHint?.timeZone,
      ip,
      label: label || "Unknown",
    }
  }

  // Lightweight public IP geo (skip localhost / private)
  if (ip && !isPrivateIp(ip)) {
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      })
      if (res.ok) {
        const json = (await res.json()) as {
          city?: string
          region?: string
          country_name?: string
          country_code?: string
          latitude?: number
          longitude?: number
          timezone?: string
          error?: boolean
        }
        if (!json.error) {
          const label = [json.city, json.region, json.country_name]
            .filter(Boolean)
            .join(", ")
          return {
            source: "ip",
            city: json.city,
            region: json.region,
            country: json.country_name,
            countryCode: json.country_code,
            latitude: json.latitude,
            longitude: json.longitude,
            timeZone: json.timezone || clientHint?.timeZone,
            ip,
            label: label || ip,
          }
        }
      }
    } catch {
      // ignore lookup failures
    }
  }

  if (clientHint?.timeZone) {
    return {
      source: "timezone",
      timeZone: clientHint.timeZone,
      ip,
      label: clientHint.timeZone,
    }
  }

  return {
    source: "unknown",
    ip,
    timeZone: clientHint?.timeZone,
    label: ip ? `IP ${ip}` : "Unknown",
  }
}

function isPrivateIp(ip: string): boolean {
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  )
}
