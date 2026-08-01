"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"

type TranslationState = {
  title: string
  excerpt: string
  paragraphs: string[]
  isTranslating: boolean
}

const clientTranslationCache = new Map<string, { title: string; excerpt: string; paragraphs: string[] }>()

export function useBlogTranslation(
  originalTitle: string,
  originalExcerpt: string,
  originalParagraphs: string[]
): TranslationState {
  const { locale } = useI18n()

  const [state, setState] = useState<TranslationState>({
    title: originalTitle,
    excerpt: originalExcerpt,
    paragraphs: originalParagraphs,
    isTranslating: false,
  })

  useEffect(() => {
    if (locale === "en") {
      setState({
        title: originalTitle,
        excerpt: originalExcerpt,
        paragraphs: originalParagraphs,
        isTranslating: false,
      })
      return
    }

    const cacheKey = `${locale}:${originalTitle}`
    if (clientTranslationCache.has(cacheKey)) {
      const cached = clientTranslationCache.get(cacheKey)!
      setState({
        ...cached,
        isTranslating: false,
      })
      return
    }

    let isMounted = true
    setState((prev) => ({ ...prev, isTranslating: true }))

    async function fetchTranslation() {
      try {
        const payload = {
          texts: [originalTitle, originalExcerpt, ...originalParagraphs],
          targetLang: locale,
        }

        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const data = await res.json()
          const translated = data.translatedTexts || []
          const translatedTitle = translated[0] || originalTitle
          const translatedExcerpt = translated[1] || originalExcerpt
          const translatedParagraphs = translated.slice(2)

          const result = {
            title: translatedTitle,
            excerpt: translatedExcerpt,
            paragraphs: translatedParagraphs.length ? translatedParagraphs : originalParagraphs,
          }

          clientTranslationCache.set(cacheKey, result)

          if (isMounted) {
            setState({
              ...result,
              isTranslating: false,
            })
          }
        } else {
          if (isMounted) setState((prev) => ({ ...prev, isTranslating: false }))
        }
      } catch (err) {
        console.error("Failed blog translation:", err)
        if (isMounted) setState((prev) => ({ ...prev, isTranslating: false }))
      }
    }

    fetchTranslation()

    return () => {
      isMounted = false
    }
  }, [locale, originalTitle, originalExcerpt, originalParagraphs])

  return state
}
