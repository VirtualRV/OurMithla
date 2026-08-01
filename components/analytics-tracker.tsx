"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export function AnalyticsTracker() {
  const pathname = usePathname()
  const startTimeRef = useRef<number>(Date.now())
  const sessionIdRef = useRef<string>("")

  useEffect(() => {
    // Generate or retrieve session ID
    if (typeof window !== "undefined") {
      let sid = sessionStorage.getItem("om_session_id")
      if (!sid) {
        sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        sessionStorage.setItem("om_session_id", sid)
      }
      sessionIdRef.current = sid
    }
  }, [])

  useEffect(() => {
    // Do not track admin path internals
    if (!pathname || pathname.startsWith("/admin")) return

    startTimeRef.current = Date.now()
    const sessionId = sessionIdRef.current || "sess_default"
    const isMobile = window.innerWidth <= 768
    const referrer = document.referrer ? new URL(document.referrer).hostname : "Direct"

    const sendBeacon = (durationSeconds: number) => {
      const payload = JSON.stringify({
        sessionId,
        path: pathname,
        referrer,
        device: isMobile ? "Mobile" : "Desktop",
        durationSeconds,
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/track", payload)
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {})
      }
    }

    // Initial view hit
    sendBeacon(1)

    // Periodic time-spent heartbeat every 10 seconds
    const interval = setInterval(() => {
      const elapsedSeconds = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000))
      sendBeacon(elapsedSeconds)
    }, 10000)

    // Page unload / route change hit
    const handleUnload = () => {
      const elapsedSeconds = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000))
      sendBeacon(elapsedSeconds)
    }

    window.addEventListener("beforeunload", handleUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener("beforeunload", handleUnload)
      handleUnload()
    }
  }, [pathname])

  return null
}
