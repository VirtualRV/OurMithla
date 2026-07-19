import type { Panchang } from '@/lib/panchang'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-serif text-base text-foreground">{value}</span>
    </div>
  )
}

export function MonthInfo({ panchang }: { panchang: Panchang }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-foreground sm:text-2xl">
          Hindu Month
        </h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Vikram Samvat {panchang.vikramSamvat}
        </span>
      </div>
      <div className="flex flex-col">
        <Row label="Amanta Month" value={panchang.amanta} />
        <Row label="Purnimanta Month" value={panchang.purnimanta} />
        <Row label="Shaka Samvat" value={String(panchang.shakaSamvat)} />
        <Row label="Ritu (Season)" value={panchang.ritu} />
        <Row label="Paksha" value={panchang.paksha} />
      </div>
    </section>
  )
}
