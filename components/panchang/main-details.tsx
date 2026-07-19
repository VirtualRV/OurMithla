import type { Panchang, PanchangElement } from '@/lib/panchang'

function ElementBlock({ el, highlight }: { el: PanchangElement; highlight?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border p-4 transition-colors ${
        highlight
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-secondary/40'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {el.label}
        </span>
        <span className="font-serif text-sm text-muted-foreground">{el.labelHi}</span>
      </div>
      <span className="font-serif text-xl leading-tight text-foreground sm:text-2xl">
        {el.value}
      </span>
      <span className="text-sm text-muted-foreground">{el.detail}</span>
    </div>
  )
}

export function MainDetails({ panchang }: { panchang: Panchang }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-foreground sm:text-2xl">
            Panchang Details
          </h2>
          <p className="text-sm text-muted-foreground">The five limbs of the day</p>
        </div>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          {panchang.paksha}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <ElementBlock el={panchang.tithi} highlight />
        </div>
        <ElementBlock el={panchang.vaar} />
        <ElementBlock el={panchang.nakshatra} />
        <ElementBlock el={panchang.yoga} />
        <ElementBlock el={panchang.karana} />
      </div>
    </section>
  )
}
