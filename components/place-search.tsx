"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, MapPin, Search, X } from "lucide-react"
import { BIRTH_PLACE_PRESETS, type BirthPlace } from "@/lib/birth-chart-types"
import { cn } from "@/lib/utils"

type SearchHit = BirthPlace & {
  label?: string
  provider?: string
}

type Props = {
  value: BirthPlace | null
  onChange: (place: BirthPlace) => void
  label?: string
}

export function PlaceSearch({ value, onChange, label = "Birth place" }: Props) {
  const [query, setQuery] = useState(
    value ? `${value.city}, ${value.region}` : "",
  )
  const [results, setResults] = useState<SearchHit[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [providerHint, setProviderHint] = useState<string | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
        const json = await res.json()
        if (!res.ok && !json.results) throw new Error(json.error || "Lookup failed")
        setResults(json.results || [])
        if (json.meta?.provider === "none" && json.meta?.message) {
          setProviderHint(json.meta.message)
        } else if (json.meta?.provider) {
          setProviderHint(
            json.meta.provider === "google"
              ? "Source: Google Places"
              : "Source: GeoNames",
          )
        } else {
          setProviderHint(null)
        }
        setOpen(true)
      } catch (err) {
        setError((err as Error).message)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function selectPlace(p: BirthPlace, labelText?: string) {
    onChange({
      id: p.id,
      city: p.city,
      region: p.region,
      lat: p.lat,
      lon: p.lon,
      timeZoneId: p.timeZoneId,
    })
    setQuery(labelText || `${p.city}, ${p.region}`)
    setOpen(false)
  }

  function clear() {
    setQuery("")
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={boxRef} className="relative">
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <MapPin className="size-3.5 text-primary" /> {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search any city (Mumbai, London, New York…)"
          className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary" />
        ) : query ? (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Clear"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {providerHint && !error && (
        <p className="mt-1 text-[11px] text-muted-foreground">{providerHint}</p>
      )}

      {value && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {value.city} · {value.lat.toFixed(4)}°, {value.lon.toFixed(4)}° ·{" "}
          <span className="font-medium text-foreground/80">{value.timeZoneId}</span>
        </p>
      )}

      {open && (
        <div className="absolute z-30 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Popular places
          </div>
          {BIRTH_PLACE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPlace(p)}
              className={cn(
                "flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted/60",
                value?.id === p.id && "bg-primary/5",
              )}
            >
              <span className="font-medium text-foreground">{p.city}</span>
              <span className="text-xs text-muted-foreground">
                {p.region} · {p.timeZoneId}
              </span>
            </button>
          ))}

          {results.length > 0 && (
            <>
              <div className="border-y border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Search results
              </div>
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectPlace(r, r.label)}
                  className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted/60"
                >
                  <span className="font-medium text-foreground line-clamp-1">{r.city}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {r.label || r.region} · {r.timeZoneId}
                  </span>
                </button>
              ))}
            </>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="px-3 py-3 text-xs text-muted-foreground">
              No API matches — pick a popular place above, or add GOOGLE_PLACES_API_KEY /
              GEONAMES_USERNAME in .env.local
            </p>
          )}
        </div>
      )}
    </div>
  )
}
