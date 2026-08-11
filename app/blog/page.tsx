import type { Metadata } from "next"
import { getAllPosts, CATEGORIES } from "@/lib/blog"
import { BlogView } from "@/components/blog/blog-view"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Stories and knowledge from the heart of Mithila — Madhubani art, festivals, cuisine, heritage, and literature.",
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  return <BlogView posts={posts} categories={[...CATEGORIES]} />
}
