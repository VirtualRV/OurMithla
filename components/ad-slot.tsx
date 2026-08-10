"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"
import { ADSENSE_CLIENT, resolveAdSlotId } from "@/lib/adsense"

type AdSlotProps = {
  /** Named placement key (e.g. "home-mid") or a raw numeric AdSense slot id. */
  slot?: string
  format?: string
  /** Visual size preset for the placeholder box. */
  variant?: "leaderboard" | "rectangle" | "sidebar" | "inline"
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<AdSlotProps["variant"]>, string> = {
  leaderboard: "min-h-[90px]",
  rectangle: "min-h-[250px]",
  sidebar: "min-h-[600px]",
  inline: "min-h-[120px]",
}

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

/**
 * AdSense slot.
 *
 * Renders a real <ins class="adsbygoogle"> unit only when a numeric AdSense
 * slot id is configured (via env mapping or a raw numeric `slot` prop).
 * Otherwise shows a layout placeholder — fake string ids like "home-mid"
 * are NOT valid AdSense slots and will not fill.
 */
export function AdSlot({ slot, format = "auto", variant = "rectangle", className }: AdSlotProps) {
  const { t } = useI18n()
  const client = ADSENSE_CLIENT
  const resolvedSlot = resolveAdSlotId(slot)
  const canServe = Boolean(client && resolvedSlot)

  useEffect(() => {
    if (!canServe) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not ready yet — ignore.
    }
  }, [canServe, resolvedSlot])

  return (
    <aside
      aria-label={t("ad.label")}
      className={cn(
        "flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40",
        SIZE_CLASSES[variant],
        className,
      )}
    >
      {canServe ? (
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={resolvedSlot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            {t("ad.label")}
          </span>
          <span className="text-xs text-muted-foreground/60">Google AdSense</span>
          {process.env.NODE_ENV === "development" && (
            <span className="mt-1 max-w-xs text-[10px] leading-relaxed text-muted-foreground/50">
              Set a numeric slot id for “{slot || "this placement"}” in .env.local
              (see .env.example). Fake labels like home-mid will not fill.
            </span>
          )}
        </div>
      )}
    </aside>
  )
}
