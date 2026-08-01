export type BlogComment = {
  id: string
  author: string
  content: string
  createdAt: string
}

export type BlogPost = {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  coverImage: string
  featured: boolean
  isPublished: boolean
  readMinutes: number
  publishedAt: string // ISO date string YYYY-MM-DD
  likesCount?: number
  comments?: BlogComment[]
}

export type BlogPostInput = Omit<BlogPost, "id"> & { id?: number }

export const CATEGORIES = ["Art", "Festivals", "Heritage", "Cuisine", "Literature"] as const

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}
