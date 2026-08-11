"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { SiteSettings } from "@/lib/settings-defaults"
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults"

type Ctx = {
  settings: SiteSettings
  refresh: () => Promise<void>
}

const SettingsContext = createContext<Ctx | null>(null)

export function SiteSettingsProvider({
  children,
  initial,
}: {
  children: React.ReactNode
  initial?: SiteSettings
}) {
  const [settings, setSettings] = useState<SiteSettings>(initial ?? DEFAULT_SETTINGS)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" })
      if (res.ok) {
        const data = (await res.json()) as SiteSettings
        setSettings(data)
      }
    } catch {
      // keep current
    }
  }, [])

  useEffect(() => {
    if (!initial) void refresh()
  }, [initial, refresh])

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>{children}</SettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    return { settings: DEFAULT_SETTINGS, refresh: async () => {} }
  }
  return ctx
}
