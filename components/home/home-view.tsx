"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpen, CalendarDays, Sparkles, Sun, Users } from "lucide-react"
import type { BlogPost } from "@/lib/blog"
import { getPanchang, LOCATIONS } from "@/lib/panchang"
import { useI18n } from "@/components/i18n-provider"
import { PostCard } from "@/components/blog/post-card"
import { AdSlot } from "@/components/ad-slot"
import { Button } from "@/components/ui/button"

function TodayPanchangCard() {
  const { t } = useI18n()
  const today = new Date()
  const p = getPanchang(new Date(today.getFullYear(), today.getMonth(), today.getDate()), LOCATIONS[0].id)

  const items = [
    { label: p.tithi.label, value: p.tithi.value },
    { label: p.nakshatra.label, value: p.nakshatra.value },
    { label: p.yoga.label, value: p.yoga.value },
    { label: p.vaar.label, value: p.vaar.value },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        <Sun className="size-5" />
        <h3 className="font-serif text-xl text-foreground">{t("home.panchang.title")}</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{t("home.panchang.desc")}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl bg-secondary/60 px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">{it.label}</dt>
            <dd className="mt-0.5 font-serif text-base text-foreground">{it.value}</dd>
          </div>
        ))}
      </dl>
      <Button
        render={<Link href="/panchang" />}
        nativeButton={false}
        variant="outline"
        size="lg"
        className="mt-5 w-full"
      >
        {t("home.panchang.open")}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}

export function HomeView({ featured, recent }: { featured: BlogPost[]; recent: BlogPost[] }) {
  const { t } = useI18n()

  const features = [
    { icon: BookOpen, title: t("home.features.blog.title"), desc: t("home.features.blog.desc"), href: "/blog" },
    { icon: CalendarDays, title: t("home.features.panchang.title"), desc: t("home.features.panchang.desc"), href: "/panchang" },
    { icon: Users, title: t("home.features.community.title"), desc: t("home.features.community.desc"), href: "/contact" },
  ]

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-muted px-3 py-1 text-xs font-medium text-terracotta">
              <Sparkles className="size-3.5" />
              {t("home.hero.eyebrow")}
            </span>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
              {t("home.hero.title")}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground text-pretty">
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href="/blog" />} nativeButton={false} size="lg">
                {t("home.hero.cta.blog")}
                <ArrowRight className="size-4" />
              </Button>
              <Button render={<Link href="/panchang" />} nativeButton={false} variant="outline" size="lg">
                {t("home.hero.cta.panchang")}
              </Button>
            </div>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border shadow-md md:aspect-[4/3]">
            <Image
              src="/images/hero-mithila.png"
              alt="Traditional Mithila Madhubani painting"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center font-serif text-3xl text-foreground text-balance">
          {t("home.features.title")}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-serif text-xl text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {t("blog.readMore")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Leaderboard ad */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AdSlot variant="leaderboard" slot="home-mid" />
      </div>

      {/* Featured + Panchang */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl text-foreground">{t("home.featured.title")}</h2>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {t("home.featured.viewAll")}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {featured.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <TodayPanchangCard />
            <AdSlot variant="rectangle" slot="home-sidebar" />
          </div>
        </div>
      </section>

      {/* Recent strip */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="font-serif text-2xl text-foreground">{t("home.latest.title")}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
