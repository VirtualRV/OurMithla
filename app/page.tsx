import type { Metadata } from "next"
import { getAllPosts } from "@/lib/blog"
import { HomeView } from "@/components/home/home-view"
import { DEFAULT_DESCRIPTION, SEO_KEYWORDS, SITE_URL } from "@/lib/site"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Mithila Panchang, Maithili Patra & Culture",
  description: DEFAULT_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  alternates: { canonical: SITE_URL },
}

export default async function HomePage() {
  const posts = await getAllPosts()
  const featured = posts.filter((p) => p.featured).slice(0, 2)
  const featuredIds = new Set(featured.map((p) => p.id))
  const recent = posts.filter((p) => !featuredIds.has(p.id)).slice(0, 3)

  return <HomeView featured={featured} recent={recent} />
}
