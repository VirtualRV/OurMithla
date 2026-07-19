import { getAllPosts } from "@/lib/blog"
import { HomeView } from "@/components/home/home-view"

export default async function HomePage() {
  const posts = await getAllPosts()
  const featured = posts.filter((p) => p.featured).slice(0, 2)
  const featuredIds = new Set(featured.map((p) => p.id))
  const recent = posts.filter((p) => !featuredIds.has(p.id)).slice(0, 3)

  return <HomeView featured={featured} recent={recent} />
}
