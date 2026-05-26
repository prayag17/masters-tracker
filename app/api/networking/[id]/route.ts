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
    if (body.status === "contacted" || body.status === "replied") {
      if (!data.outreachDate) data.outreachDate = new Date()
    }
    const updated = await prisma.networkingContact.update({
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
  await prisma.networkingContact.delete({ where: { id, profileId: result.profile.id } })
  return NextResponse.json({ ok: true })
}
