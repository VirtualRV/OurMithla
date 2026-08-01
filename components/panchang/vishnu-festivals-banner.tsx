import type { Panchang } from "@/lib/panchang"
import { Sparkles, Moon, Sun, Calendar, UtensilsCrossed } from "lucide-react"

export function VishnuFestivalsBanner({ panchang }: { panchang: Panchang }) {
  const { vishnuStatus, festivals, fastingNote } = panchang

  return (
    <div className="flex flex-col gap-4">
      {/* ── Lord Vishnu Sleep Status Card ────────────────── */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-md transition-all ${
          vishnuStatus.isSleeping
            ? "border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-purple-950/20 to-background dark:from-amber-950/40 dark:via-purple-950/40"
            : "border-primary/30 bg-gradient-to-r from-primary/10 via-amber-500/10 to-background"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-inner ${
                vishnuStatus.isSleeping
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {vishnuStatus.isSleeping ? "☸️" : "☀️"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {vishnuStatus.isSleeping ? "Chaturmas Special" : "Devuthani Period"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {vishnuStatus.isSleeping ? <Moon className="size-3" /> : <Sun className="size-3" />}
                  {vishnuStatus.isSleeping ? "Yog Nidra Active" : "Hari Awakened"}
                </span>
              </div>
              <h3 className="mt-1 font-serif text-xl font-bold text-foreground sm:text-2xl">
                {vishnuStatus.title}
              </h3>
              <p className="text-xs font-serif text-muted-foreground">{vishnuStatus.titleHi}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground/90 sm:text-sm">
                {vishnuStatus.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Festivals & Vrats Card ────────────────── */}
      {(festivals.length > 0 || fastingNote) && (
        <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Sparkles className="size-5 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Today's Vrat & Parv (व्रत एवं त्योहार)</h3>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {festivals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {festivals.map((fest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary shadow-xs"
                  >
                    <Calendar className="size-4 shrink-0" />
                    {fest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No major fast / festival today.</p>
            )}

            {fastingNote && (
              <div className="mt-1 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                <UtensilsCrossed className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>{fastingNote}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
