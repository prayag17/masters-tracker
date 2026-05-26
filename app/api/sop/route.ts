import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionProfile } from "@/lib/session"

export async function GET() {
  const result = await getSessionProfile()
  if (result.error) return result.error

  const sops = await prisma.sOPIteration.findMany({
    where:   { profileId: result.profile.id },
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(sops)
}

export async function POST(req: Request) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  try {
    const body = await req.json()
    const wordCount = (body.content ?? "").split(/\s+/).filter(Boolean).length

    const latest = await prisma.sOPIteration.findFirst({
      where:   { profileId: result.profile.id },
      orderBy: { version: "desc" },
    })

    const sop = await prisma.sOPIteration.create({
      data: {
        title:       body.title ?? "Untitled Draft",
        content:     body.content ?? "",
        wordCount,
        version:     (latest?.version ?? 0) + 1,
        universityId: body.universityId ?? null,
        profileId:   result.profile.id,
      },
    })
    return NextResponse.json(sop)
  } catch (e) {
    return NextResponse.json({ error: "Failed to create SOP" }, { status: 500 })
  }
}
