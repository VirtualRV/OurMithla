"use client"

import Link from "next/link"
import { Mail } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useSiteSettings } from "@/components/site-settings-provider"
import type { TranslationKey } from "@/lib/i18n/translations"

const LINKS: { href: string; key: TranslationKey; flag?: "submit" | "horoscope" | "kundli" }[] = [
  { href: "/", key: "nav.home" },
  { href: "/blog", key: "nav.blog" },
  { href: "/panchang", key: "nav.panchang" },
  { href: "/horoscope", key: "nav.horoscope", flag: "horoscope" },
  { href: "/kundli", key: "nav.kundli", flag: "kundli" },
  { href: "/submit", key: "nav.submit", flag: "submit" },
  { href: "/contact", key: "nav.contact" },
]

export function SiteFooter() {
  const { t } = useI18n()
  const { settings } = useSiteSettings()
  const year = new Date().getFullYear()

  const links = LINKS.filter((item) => {
    if (item.flag === "submit") return settings.allowPublicBlogSubmit
    if (item.flag === "horoscope") return settings.enableHoroscope
    if (item.flag === "kundli") return settings.enableBirthChart
    return true
  })

  return (
    <footer className="mt-16 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary font-serif text-lg text-primary-foreground">
              ॐ
            </span>
            <span className="font-serif text-lg text-foreground">{t("brand.name")}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t("footer.about.desc")}
          </p>
          <div className="mt-4 flex flex-col gap-1.5">
            <a
              href="mailto:Info@hibousoft.com"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <Mail className="size-3.5 shrink-0" />
              Info@hibousoft.com
            </a>
            <a
              href="tel:+911204383077"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              +91 120 438 3077 / 7042046060
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-base text-foreground">{t("footer.links.title")}</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <div>
            © {year} {t("brand.name")}. {t("footer.rights")} Developed by{" "}
            <a
              href="https://hibousoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              Hibousoft
            </a>
          </div>
          <div>
            <Link
              href="/admin"
              className="text-muted-foreground/70 hover:text-primary transition-colors font-medium"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
