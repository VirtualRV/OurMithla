import { NextResponse } from "next/server"

// In-memory cache for translations: key = `${targetLang}:${textHash}`
const translationCache = new Map<string, string>()

async function translateSingleText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text
  if (targetLang === "en") return text

  const cacheKey = `${targetLang}:${text.trim()}`
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }

  try {
    // Call Google Translate free endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      next: { revalidate: 86400 }, // Cache for 24h
    })

    if (!res.ok) {
      return text
    }

    const data = await res.json()
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0]
        .map((segment: unknown[]) => (Array.isArray(segment) ? segment[0] : ""))
        .join("")
      if (translated) {
        translationCache.set(cacheKey, translated)
        return translated
      }
    }

    return text
  } catch (err) {
    console.error("[Translate API Error]:", err)
    return text
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { texts, targetLang } = body

    if (!targetLang || targetLang === "en" || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ translatedTexts: texts || [] })
    }

    // Map targetLang 'mai' -> 'mai' (Maithili) or fallback 'hi' if needed
    const langCode = targetLang === "mai" ? "mai" : targetLang === "hi" ? "hi" : "en"

    const translatedTexts = await Promise.all(
      texts.map((t: string) => translateSingleText(t, langCode))
    )

    return NextResponse.json({ translatedTexts })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
