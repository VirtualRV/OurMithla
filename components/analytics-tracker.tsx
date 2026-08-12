"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { readVisitorProfile } from "@/lib/visitor-profile"
import type {
  CustomerDetails,
  DeviceDetails,
  DeviceKind,
  VisitorLocation,
} from "@/lib/analytics-types"

function detectDeviceKind(): DeviceKind {
  const ua = navigator.userAgent
  const w = window.innerWidth
  if (/iPad|Tablet/i.test(ua) || (w > 768 && w <= 1024 && "ontouchstart" in window)) {
    return "Tablet"
  }
  if (w <= 768 || /Mobi|Android|iPhone/i.test(ua)) return "Mobile"
  return "Desktop"
}

function parseBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge"
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome"
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari"
  if (/Firefox\//.test(ua)) return "Firefox"
  return "Other"
}

function parseOs(ua: string): string {
  if (/Windows/i.test(ua)) return "Windows"
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS"
  if (/Android/i.test(ua)) return "Android"
  if (/iPhone|iPad|iOS/i.test(ua)) return "iOS"
  if (/Linux/i.test(ua)) return "Linux"
  return "Other"
}

function collectDeviceDetails(): DeviceDetails {
  const ua = navigator.userAgent
  return {
    kind: detectDeviceKind(),
    userAgent: ua.slice(0, 240),
    browser: parseBrowser(ua),
    os: parseOs(ua),
    screen: `${window.screen.width}×${window.screen.height}`,
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    touch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  }
}

async function tryDeviceLocation(timeZone: string): Promise<Partial<VisitorLocation> | null> {
  if (!("geolocation" in navigator)) {
    return { timeZone, source: "timezone" }
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ timeZone, source: "timezone" }), 2500)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timer)
        const { latitude, longitude } = pos.coords
        let city: string | undefined
        let region: string | undefined
        let country: string | undefined
        try {
          const rev = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          )
          if (rev.ok) {
            const j = (await rev.json()) as {
              city?: string
              locality?: string
              principalSubdivision?: string
              countryName?: string
              countryCode?: string
            }
            city = j.city || j.locality
            region = j.principalSubdivision
            country = j.countryName
          }
        } catch {
          // keep coords only
        }
        const label =
          [city, region, country].filter(Boolean).join(", ") ||
          `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
        resolve({
          source: "device",
          latitude,
          longitude,
          city,
          region,
          country,
          timeZone,
          label,
        })
      },
      () => {
        clearTimeout(timer)
        resolve({ timeZone, source: "timezone" })
      },
      { enableHighAccuracy: false, timeout: 2000, maximumAge: 600_000 },
    )
  })
}

export function AnalyticsTracker() {
  const pathname = usePathname()
  const startTimeRef = useRef<number>(Date.now())
  const sessionIdRef = useRef<string>("")
  const locationRef = useRef<Partial<VisitorLocation> | null>(null)
  const locationReadyRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    let sid = sessionStorage.getItem("om_session_id")
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      sessionStorage.setItem("om_session_id", sid)
    }
    sessionIdRef.current = sid

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    void tryDeviceLocation(tz).then((loc) => {
      locationRef.current = loc
      locationReadyRef.current = true
    })
  }, [])

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return

    startTimeRef.current = Date.now()
    const sessionId = sessionIdRef.current || "sess_default"
    const deviceDetails = collectDeviceDetails()
    const profile = readVisitorProfile()
    const customer: CustomerDetails | undefined = profile
      ? {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          source: profile.source === "contact" || profile.source === "submit" ? profile.source : "known",
        }
      : undefined

    const pageName =
      typeof document !== "undefined" && document.title
        ? document.title.replace(/\s*\|\s*OurMithla.*$/i, "").trim() || document.title
        : pathname

    let referrer = "Direct"
    try {
      referrer = document.referrer ? new URL(document.referrer).hostname || "Direct" : "Direct"
    } catch {
      referrer = "Direct"
    }

    const sendBeacon = (durationSeconds: number) => {
      const payload = JSON.stringify({
        sessionId,
        path: pathname,
        pageName,
        referrer,
        device: deviceDetails.kind,
        deviceDetails,
        location: locationRef.current,
        customer,
        durationSeconds,
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/track", new Blob([payload], { type: "application/json" }))
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {})
      }
    }

    // Small delay so title / geo can settle after client navigation
    const initial = window.setTimeout(() => sendBeacon(1), 400)

    const interval = setInterval(() => {
      const elapsedSeconds = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000))
      sendBeacon(elapsedSeconds)
    }, 10000)

    const handleUnload = () => {
      const elapsedSeconds = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000))
      sendBeacon(elapsedSeconds)
    }

    window.addEventListener("beforeunload", handleUnload)

    return () => {
      window.clearTimeout(initial)
      clearInterval(interval)
      window.removeEventListener("beforeunload", handleUnload)
      handleUnload()
    }
  }, [pathname])

  return null
}
