"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, ArrowUpRight, Heart, MessageSquare } from "lucide-react"
import type { BlogPost } from "@/lib/blog-types"
import { useI18n } from "@/components/i18n-provider"

// Category colours — consistent across blog components
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Art:        { bg: "bg-violet-100 dark:bg-violet-900/30",   text: "text-violet-700 dark:text-violet-300" },
  Festivals:  { bg: "bg-amber-100 dark:bg-amber-900/30",    text: "text-amber-700 dark:text-amber-300" },
  Heritage:   { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  Cuisine:    { bg: "bg-orange-100 dark:bg-orange-900/30",  text: "text-orange-700 dark:text-orange-300" },
  Literature: { bg: "bg-sky-100 dark:bg-sky-900/30",        text: "text-sky-700 dark:text-sky-300" },
}

function formatDate(iso: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
}

export function PostCard({ post }: { post: BlogPost }) {
  const { t } = useI18n()
  const catColor = CATEGORY_COLORS[post.category] ?? { bg: "bg-primary/10", text: "text-primary" }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Cover image */}
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/10] overflow-hidden"
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={post.coverImage || "/placeholder.jpg"}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        {/* Subtle gradient at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Category badge (on image) */}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm backdrop-blur-sm ${catColor.bg} ${catColor.text}`}
        >
          {post.category}
        </span>

        {/* Arrow icon hint */}
        <span className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-white/80 opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100 dark:bg-black/60">
          <ArrowUpRight className="size-3.5 text-foreground" />
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        {/* Date */}
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>{formatDate(post.publishedAt)}</span>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 text-rose-500">
              <Heart className="size-3 fill-rose-500/20" />
              {post.likesCount ?? 0}
            </span>
            <span className="inline-flex items-center gap-1 text-primary">
              <MessageSquare className="size-3" />
              {post.comments?.length ?? 0}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-[1.05rem] leading-snug text-foreground text-balance">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="mt-0.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>

        {/* Footer meta */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">{post.author}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {post.readMinutes} {t("blog.minRead")}
          </span>
        </div>
      </div>
    </article>
  )
}
