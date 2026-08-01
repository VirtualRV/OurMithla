"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"

type AdSlotProps = {
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
 * When NEXT_PUBLIC_ADSENSE_CLIENT is set, renders a real <ins class="adsbygoogle">
 * unit (the AdSense script is loaded once in the root layout). Otherwise it shows a
 * styled placeholder so the layout stays intact during development.
 */
export function AdSlot({ slot, format = "auto", variant = "rectangle", className }: AdSlotProps) {
  const { t } = useI18n()
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-3653662664461490"

  useEffect(() => {
    if (!client) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not ready yet — ignore.
    }
  }, [client])

  return (
    <aside
      aria-label={t("ad.label")}
      className={cn(
        "flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40",
        SIZE_CLASSES[variant],
        className,
      )}
    >
      {client && slot ? (
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            {t("ad.label")}
          </span>
          <span className="text-xs text-muted-foreground/60">Google AdSense</span>
        </div>
      )}
    </aside>
  )
}
