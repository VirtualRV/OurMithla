/** Persist known visitor details after contact / article submit (client-only). */

export type StoredVisitor = {
  name?: string
  email?: string
  phone?: string
  source?: "contact" | "submit"
  updatedAt: string
}

const KEY = "om_visitor_profile"

export function saveVisitorProfile(data: {
  name?: string
  email?: string
  phone?: string
  source: "contact" | "submit"
}) {
  if (typeof window === "undefined") return
  try {
    const next: StoredVisitor = {
      name: data.name?.trim() || undefined,
      email: data.email?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      source: data.source,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function readVisitorProfile(): StoredVisitor | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredVisitor
  } catch {
    return null
  }
}
