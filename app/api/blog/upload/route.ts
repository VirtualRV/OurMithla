import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"])

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 })
    }

    const originalName = file.name || "image"
    const ext = path.extname(originalName).toLowerCase() || ".jpg"
    if (!ALLOWED.has(ext)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP, or GIF images are allowed" },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "submissions")
    if (!fs.existsSync(uploadsDir)) {
      await fs.promises.mkdir(uploadsDir, { recursive: true })
    }

    const nameWithoutExt = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40)
    const filename = `sub_${Date.now()}_${nameWithoutExt}${ext}`
    const filePath = path.join(uploadsDir, filename)
    await fs.promises.writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/submissions/${filename}`,
      filename: originalName,
    })
  } catch (err) {
    console.error("[Blog Upload]", err)
    return NextResponse.json({ error: (err as Error).message || "Failed to upload" }, { status: 500 })
  }
}
