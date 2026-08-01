import { NextResponse } from "next/server"
import { addComment } from "@/lib/blog"

type Props = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Props) {
  const { id } = await params
  const numId = Number(id)
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { author, content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment text cannot be empty" }, { status: 400 })
    }

    const comments = await addComment(numId, author || "Reader", content)
    if (!comments) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ comments }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
