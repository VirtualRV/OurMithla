"use client"

import { useI18n } from "@/components/i18n-provider"
import { useBlogTranslation } from "@/lib/use-blog-translation"
import { Globe, Languages, Loader2 } from "lucide-react"
import type { Locale } from "@/lib/i18n/translations"

type Props = {
  originalTitle: string
  originalExcerpt: string
  originalParagraphs: string[]
  category: string
  author: string
  publishedAtFormatted: string
  readMinutes: number
  likesCount: number
  commentsCount: number
  catColor: { bg: string; text: string }
  children?: React.ReactNode
}

export function BlogTranslationWrapper({
  originalTitle,
  originalExcerpt,
  originalParagraphs,
  category,
  author,
  publishedAtFormatted,
  readMinutes,
  likesCount,
  commentsCount,
  catColor,
}: Props) {
  const { locale, setLocale } = useI18n()
  const { title, excerpt, paragraphs, isTranslating } = useBlogTranslation(
    originalTitle,
    originalExcerpt,
    originalParagraphs
  )

  const LANG_OPTIONS: { code: Locale; label: string }[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "mai", label: "मैथिली" },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      {/* Meta header — overlaps the hero */}
      <div className="-mt-28 relative pb-8">
        {/* Category & Language Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${catColor.bg} ${catColor.text}`}
          >
            {category}
          </span>

          {/* Quick Language Switcher */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 p-1 backdrop-blur-md shadow-sm">
            <span className="flex items-center gap-1 px-2.5 text-xs font-semibold text-muted-foreground">
              <Globe className="size-3.5 text-primary" />
              Language:
            </span>
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLocale(opt.code)}
                className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                  locale === opt.code
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Indicator Badge */}
        {isTranslating && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <Loader2 className="size-3.5 animate-spin" />
            <span>Translating article into {locale === "hi" ? "हिन्दी" : "मैथिली"}...</span>
          </div>
        )}

        {/* Title */}
        <h1 className="mt-4 font-serif text-3xl leading-tight text-foreground text-balance sm:text-4xl lg:text-5xl transition-all">
          {title}
        </h1>

        {/* Excerpt / sub-heading */}
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty transition-all">
          {excerpt}
        </p>

        {/* Meta bar */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-6 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{author}</span>
          <span>·</span>
          <span>{publishedAtFormatted}</span>
          <span>·</span>
          <span>{readMinutes} min read</span>
          <span>·</span>
          <span>{likesCount} likes</span>
          <span>·</span>
          <span>{commentsCount} comments</span>
        </div>
      </div>

      {/* Article body */}
      <article className="prose-custom pb-8 transition-all">
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="mb-6 text-base leading-[1.85] text-foreground/90 last:mb-0 sm:text-[1.05rem]"
          >
            {para}
          </p>
        ))}
      </article>
    </div>
  )
}
