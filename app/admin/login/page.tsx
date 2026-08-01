"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, KeyRound, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push("/admin")
        router.refresh()
      } else {
        setError(data.error || "Incorrect admin password")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl backdrop-blur-sm">
          {/* Header */}
          <div className="bg-primary/5 px-8 pt-8 pb-6 text-center border-b border-border/50">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">Admin Portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your admin password to manage blog posts
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
                <AlertCircle className="size-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Admin Password / PIN
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <KeyRound className="size-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  required
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm font-medium placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground/80">
                Default password: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground font-semibold">admin123</code> (configurable via <code className="font-mono">ADMIN_SECRET</code> in .env.local)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="size-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
