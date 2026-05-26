import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionProfile } from "@/lib/session"

export async function GET() {
  const result = await getSessionProfile()
  if (result.error) return result.error

  const universities = await prisma.university.findMany({
    where:   { profileId: result.profile.id },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(universities)
}

export async function POST(req: Request) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  try {
    const body = await req.json()
    const university = await prisma.university.create({
      data: {
        name:        body.name,
        country:     body.country,
        city:        body.city ?? null,
        programName: body.programName,
        department:  body.department ?? null,
        priority:    body.priority ?? "medium",
        websiteUrl:  body.websiteUrl || null,
        profileId:   result.profile.id,
      },
    })
    return NextResponse.json(university)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create university" }, { status: 500 })
  }
}
