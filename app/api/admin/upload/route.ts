import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import fs from "fs"
import path from "path"

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")
  return token?.value === "authenticated"
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadsDir)) {
      await fs.promises.mkdir(uploadsDir, { recursive: true })
    }

    // Sanitize filename
    const originalName = file.name || "file"
    const ext = path.extname(originalName).toLowerCase() || ".bin"
    const nameWithoutExt = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_")
    const filename = `file_${Date.now()}_${nameWithoutExt}${ext}`

    const filePath = path.join(uploadsDir, filename)
    await fs.promises.writeFile(filePath, buffer)

    const fileUrl = `/uploads/${filename}`
    return NextResponse.json({ success: true, url: fileUrl, filename: originalName })
  } catch (err) {
    console.error("[Upload API] Error saving file:", err)
    return NextResponse.json({ error: (err as Error).message || "Failed to upload file" }, { status: 500 })
  }
}
