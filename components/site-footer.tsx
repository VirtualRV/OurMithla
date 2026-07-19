"use client"

import Link from "next/link"
import { Mail, Rss, Send } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import type { TranslationKey } from "@/lib/i18n/translations"

const LINKS: { href: string; key: TranslationKey }[] = [
  { href: "/", key: "nav.home" },
  { href: "/blog", key: "nav.blog" },
  { href: "/panchang", key: "nav.panchang" },
  { href: "/contact", key: "nav.contact" },
]

export function SiteFooter() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
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
            {LINKS.map((l) => (
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

        <div>
          <h3 className="font-serif text-base text-foreground">{t("footer.follow.title")}</h3>
          <div className="mt-3 flex items-center gap-3">
            {[
              { icon: Send, label: "Telegram" },
              { icon: Mail, label: "Newsletter" },
              { icon: Rss, label: "RSS feed" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
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
      </div>
    </footer>
  )
}
