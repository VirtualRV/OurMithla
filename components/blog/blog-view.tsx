"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Tag,
  BookOpen,
} from "lucide-react"
import type { BlogPost } from "@/lib/blog"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"
import { PostCard } from "@/components/blog/post-card"
import { AdSlot } from "@/components/ad-slot"

const PAGE_SIZE = 6

// Category accent colours — consistent with post page
const CATEGORY_COLORS: Record<string, { bg: string; text: string; activeBg: string; activeText: string }> = {
  Art:        { bg: "bg-violet-100 dark:bg-violet-900/30",   text: "text-violet-700 dark:text-violet-300",  activeBg: "bg-violet-600",  activeText: "text-white" },
  Festivals:  { bg: "bg-amber-100 dark:bg-amber-900/30",    text: "text-amber-700 dark:text-amber-300",    activeBg: "bg-amber-600",   activeText: "text-white" },
  Heritage:   { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", activeBg: "bg-emerald-600", activeText: "text-white" },
  Cuisine:    { bg: "bg-orange-100 dark:bg-orange-900/30",  text: "text-orange-700 dark:text-orange-300",  activeBg: "bg-orange-600",  activeText: "text-white" },
  Literature: { bg: "bg-sky-100 dark:bg-sky-900/30",        text: "text-sky-700 dark:text-sky-300",        activeBg: "bg-sky-600",     activeText: "text-white" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function BlogView({ posts, categories }: { posts: BlogPost[]; categories: string[] }) {
  const { t } = useI18n()
  const [category, setCategory] = useState<string>("all")
  const [page, setPage] = useState(1)

  // The featured hero post (only shown when viewing "all")
  const featuredPost = posts.find((p) => p.featured) ?? posts[0]

  // ── FIX: filtered now includes ALL posts (including featured)
  // Featured hero is only rendered above the grid in "all" mode.
  const filtered = useMemo(() => {
    if (category === "all") return posts
    return posts.filter((p) => p.category === category)
  }, [posts, category])

  // Posts shown in the grid: in "all" mode, exclude the hero featured post from the grid
  const gridPosts = useMemo(() => {
    if (category === "all") return filtered.filter((p) => p.id !== featuredPost?.id)
    return filtered
  }, [filtered, category, featuredPost])

  const totalPages = Math.max(1, Math.ceil(gridPosts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = gridPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const changeCategory = (c: string) => {
    setCategory(c)
    setPage(1)
  }

  // Category counts (over all posts)
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: posts.length }
    for (const c of categories) {
      map[c] = posts.filter((p) => p.category === c).length
    }
    return map
  }, [posts, categories])

  return (
    <main className="min-h-screen bg-background">
      {/* ── Page header ─────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-secondary/40 to-background px-4 py-14 text-center sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <BookOpen className="size-3.5" />
          OurMithla
        </span>
        <h1 className="mt-3 font-serif text-4xl text-foreground text-balance sm:text-5xl">
          {t("blog.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-pretty">
          {t("blog.subtitle")}
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">

        {/* ── Featured hero (all mode only) ───────────────── */}
        {category === "all" && featuredPost && (
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group mb-12 grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-lg md:grid-cols-[1.2fr_1fr]"
          >
            <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto md:min-h-[360px]">
              <Image
                src={featuredPost.coverImage || "/placeholder.jpg"}
                alt={featuredPost.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/30" />
            </div>
            <div className="flex flex-col justify-center gap-4 p-7 sm:p-10">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/25 px-3 py-1 text-xs font-semibold text-terracotta">
                  <Star className="size-3.5 fill-terracotta" />
                  {t("blog.featured")}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {featuredPost.category}
                </span>
              </div>
              <h2 className="font-serif text-2xl leading-snug text-foreground text-balance transition-colors group-hover:text-primary sm:text-3xl">
                {featuredPost.title}
              </h2>
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {featuredPost.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">{featuredPost.author}</span>
                <span>{formatDate(featuredPost.publishedAt)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {featuredPost.readMinutes} {t("blog.minRead")}
                </span>
              </div>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-2.5">
                {t("blog.readMore")}
                <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        )}

        {/* ── Main content + sidebar ───────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            {/* Category filter pills */}
            <div className="mb-8 flex flex-wrap items-center gap-2">
              {["all", ...categories].map((c) => {
                const isActive = category === c
                const colors = c !== "all" ? CATEGORY_COLORS[c] : null
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => changeCategory(c)}
                    className={cn(
                      "relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                      isActive
                        ? c === "all"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : `${colors?.activeBg} ${colors?.activeText} shadow-sm`
                        : c === "all"
                        ? "border border-border bg-card text-foreground/70 hover:bg-muted"
                        : `border border-border bg-card ${colors?.text} hover:${colors?.bg}`,
                    )}
                  >
                    {c === "all" ? t("blog.categories.all") : c}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {categoryCounts[c] ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Posts grid */}
            {pageItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
                <Tag className="size-8 text-muted-foreground/40" />
                <p className="text-muted-foreground">{t("blog.empty")}</p>
                <button
                  type="button"
                  onClick={() => changeCategory("all")}
                  className="mt-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  View all articles
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((post, i) => (
                  <div key={post.id} className="contents">
                    <PostCard post={post} />
                    {/* Inline ad after 4th card */}
                    {i === 3 && (
                      <div className="sm:col-span-2 xl:col-span-3">
                        <AdSlot variant="leaderboard" slot="blog-inline" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      p === currentPage
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="flex flex-col gap-6">
            {/* Popular posts */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-serif text-lg text-foreground">{t("home.featured.title")}</h3>
              <ul className="mt-4 flex flex-col divide-y divide-border">
                {posts.slice(0, 5).map((p) => (
                  <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                    <Link href={`/blog/${p.slug}`} className="group flex items-start gap-3">
                      <div className="relative mt-0.5 size-14 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={p.coverImage || "/placeholder.jpg"}
                          alt={p.title}
                          fill
                          sizes="56px"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                          {p.title}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="size-3" />
                          {p.readMinutes} min
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories widget */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-serif text-lg text-foreground">Categories</h3>
              <ul className="mt-4 flex flex-col gap-2">
                {categories.map((c) => {
                  const colors = CATEGORY_COLORS[c]
                  return (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => changeCategory(c)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          category === c
                            ? `${colors?.activeBg} ${colors?.activeText}`
                            : `hover:${colors?.bg} ${colors?.text}`,
                        )}
                      >
                        <span>{c}</span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            category === c ? "bg-white/25 text-white" : `${colors?.bg} ${colors?.text}`,
                          )}
                        >
                          {categoryCounts[c]}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <AdSlot variant="sidebar" slot="blog-sidebar" />
          </aside>
        </div>
      </div>
    </main>
  )
}
