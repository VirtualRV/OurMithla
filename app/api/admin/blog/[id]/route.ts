import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { updatePost, deletePost, getPostById } from "@/lib/blog"

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")
  return token?.value === "authenticated"
}

type Props = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Props) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numId = Number(id)
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
  }

  const post = await getPostById(numId)
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(request: Request, { params }: Props) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numId = Number(id)
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const updated = await updatePost(numId, body)
    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Props) {
  return PUT(request, { params })
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numId = Number(id)
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
  }

  try {
    const success = await deletePost(numId)
    if (!success) {
      return NextResponse.json({ error: "Post not found or could not be deleted" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
