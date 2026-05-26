import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUserId } from "@/lib/session"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(req: Request) {
  const result = await getAuthUserId()
  if ("error" in result) return result.error

  try {
    const formData = await req.formData()
    const file = formData.get("cv") as File | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large — max 5 MB" }, { status: 400 })
    }

    const uploadsDir = join(process.cwd(), "uploads", result.userId)
    await mkdir(uploadsDir, { recursive: true })

    const fileName = `cv_${Date.now()}.pdf`
    const filePath = join(uploadsDir, fileName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Store relative path in DB
    const cvFilePath = `/uploads/${result.userId}/${fileName}`

    await prisma.userProfile.update({
      where: { clerkUserId: result.userId },
      data:  { cvFilePath, cvFileName: file.name },
    })

    return NextResponse.json({ ok: true, cvFilePath, cvFileName: file.name })
  } catch (e) {
    console.error("CV upload error:", e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
