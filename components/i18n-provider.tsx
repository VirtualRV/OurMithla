"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  DEFAULT_LOCALE,
  type Locale,
  type TranslationKey,
  translations,
} from "@/lib/i18n/translations"

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = "ourmithla.locale"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  // Restore saved locale on mount (client only).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && saved in translations) {
      setLocaleState(saved)
      document.documentElement.lang = saved
    }
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
  }, [])

  const t = useCallback(
    (key: TranslationKey) => {
      const dict = translations[locale] as Record<string, string>
      return dict[key] ?? translations[DEFAULT_LOCALE][key] ?? key
    },
    [locale],
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return ctx
}
