import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionProfile } from "@/lib/session"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  try {
    const { id } = await params
    const body = await req.json()
    const updated = await prisma.expense.update({
      where: { id, profileId: result.profile.id },
      data:  body,
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
  await prisma.expense.delete({ where: { id, profileId: result.profile.id } })
  return NextResponse.json({ ok: true })
}
