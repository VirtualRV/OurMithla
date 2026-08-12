import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getAllAdminPosts, createPost } from "@/lib/blog"

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")
  return token?.value === "authenticated"
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const posts = await getAllAdminPosts()
    return NextResponse.json(posts)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.title || !body.excerpt || !body.content || !body.category) {
      return NextResponse.json(
        { error: "Title, excerpt, content, and category are required" },
        { status: 400 },
      )
    }

    const post = await createPost(body)
    revalidatePath("/blog")
    revalidatePath("/")
    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
