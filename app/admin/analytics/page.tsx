import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"

export const metadata: Metadata = {
  title: "Visitor Analytics",
  description:
    "Full OurMithla traffic analytics — page names, visitor locations, device details, and known customer activity.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: "Visitor Analytics | OurMithla Admin",
    description: "Admin-only analytics for pageviews, locations, devices, and customers.",
    type: "website",
  },
}

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")
  if (token?.value !== "authenticated") {
    redirect("/admin/login")
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">OurMithla Admin</p>
        <h1 className="mt-1 font-serif text-3xl text-foreground sm:text-4xl">Visitor Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Full view of where visitors come from, which pages they read, device details, and customer
          details when they have contacted you or submitted an article.
        </p>
      </div>
      <AnalyticsDashboard fullPage />
    </main>
  )
}
