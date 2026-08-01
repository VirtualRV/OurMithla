import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin123"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")
  const isAuthenticated = token?.value === "authenticated"
  return NextResponse.json({ authenticated: isAuthenticated })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    if (password === ADMIN_SECRET) {
      const cookieStore = await cookies()
      cookieStore.set("admin_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_token")
  return NextResponse.json({ success: true })
}
