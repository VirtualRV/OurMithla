import { NextResponse } from "next/server"
import { likePost } from "@/lib/blog"

type Props = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params
  const numId = Number(id)
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
  }

  try {
    const likesCount = await likePost(numId)
    return NextResponse.json({ likesCount })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
