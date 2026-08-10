import { NextResponse } from "next/server"
import { submitUserPost } from "@/lib/blog"
import { CATEGORIES } from "@/lib/blog-types"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : ""
    const content = typeof body.content === "string" ? body.content.trim() : ""
    const author = typeof body.author === "string" ? body.author.trim() : ""
    const submitterEmail =
      typeof body.submitterEmail === "string" ? body.submitterEmail.trim().toLowerCase() : ""
    const category = typeof body.category === "string" ? body.category.trim() : ""
    const coverImage =
      typeof body.coverImage === "string" && body.coverImage.trim()
        ? body.coverImage.trim()
        : "/placeholder.jpg"

    if (!title || !excerpt || !content || !author || !submitterEmail || !category) {
      return NextResponse.json(
        { error: "Title, excerpt, content, author, email, and category are required" },
        { status: 400 },
      )
    }

    if (!EMAIL_RE.test(submitterEmail)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    if (!(CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    if (title.length > 200 || excerpt.length > 500 || content.length > 50000) {
      return NextResponse.json({ error: "One or more fields exceed the maximum length" }, { status: 400 })
    }

    const post = await submitUserPost({
      title,
      excerpt,
      content,
      author,
      category,
      coverImage,
      submitterEmail,
      slug: "",
      readMinutes: 1,
      featured: false,
      isPublished: false,
      publishedAt: new Date().toISOString().slice(0, 10),
    })

    return NextResponse.json(
      {
        success: true,
        id: post.id,
        slug: post.slug,
        message: "Your article was submitted and is awaiting admin approval.",
      },
      { status: 201 },
    )
  } catch (err) {
    console.error("[Blog Submit]", err)
    return NextResponse.json({ error: (err as Error).message || "Failed to submit" }, { status: 500 })
  }
}
