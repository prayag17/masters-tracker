import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionProfile } from "@/lib/session"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  const { id } = await params
  const university = await prisma.university.findFirst({
    where: { id, profileId: result.profile.id },
  })
  if (!university) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(university)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  try {
    const { id } = await params
    const body = await req.json()
    const updated = await prisma.university.update({
      where: { id, profileId: result.profile.id },
      data: body,
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  const { id } = await params
  await prisma.university.delete({ where: { id, profileId: result.profile.id } })
  return NextResponse.json({ ok: true })
}
