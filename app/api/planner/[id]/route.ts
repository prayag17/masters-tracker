import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionProfile } from "@/lib/session"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = { ...body }
    if (body.completed === true)  data.completedAt = new Date()
    if (body.completed === false) data.completedAt = null
    const updated = await prisma.dailyTask.update({
      where: { id, profileId: result.profile.id },
      data,
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  const { id } = await params
  await prisma.dailyTask.delete({ where: { id, profileId: result.profile.id } })
  return NextResponse.json({ ok: true })
}
