import type { Metadata } from "next"
import { getAllPosts, CATEGORIES } from "@/lib/blog"
import { BlogView } from "@/components/blog/blog-view"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Mithila Blog — Madhubani, Chhath & Heritage",
  description:
    "Stories from Mithila — Madhubani painting, Chhath Puja, Sama-Chakeva, Vidyapati, makhana, and Janakpur heritage in English, Hindi, and Maithili.",
  alternates: { canonical: "https://ourmithla.com/blog" },
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  return <BlogView posts={posts} categories={[...CATEGORIES]} />
}
