import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionProfile } from "@/lib/session"

export async function GET() {
  const result = await getSessionProfile()
  if (result.error) return result.error

  const contacts = await prisma.networkingContact.findMany({
    where:   { profileId: result.profile.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(contacts)
}

export async function POST(req: Request) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  try {
    const body = await req.json()
    const contact = await prisma.networkingContact.create({
      data: {
        name:        body.name,
        title:       body.title,
        university:  body.university,
        department:  body.department ?? null,
        linkedinUrl: body.linkedinUrl || null,
        email:       body.email || null,
        type:        body.type,
        status:      body.status ?? "not-contacted",
        notes:       body.notes ?? null,
        profileId:   result.profile.id,
      },
    })
    return NextResponse.json(contact)
  } catch (e) {
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
  }
}
