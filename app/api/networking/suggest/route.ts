import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { suggestNetworkingTargets } from "@/lib/llm"

export async function POST(req: Request) {
  try {
    const profile = await prisma.userProfile.findFirst()
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 })

    const body = await req.json()
    const researchInterests: string = body.researchInterests ?? ""

    const universities = await prisma.university.findMany({
      where: { profileId: profile.id },
      select: { name: true, programName: true, department: true },
    })

    if (universities.length === 0) {
      return NextResponse.json({ error: "No universities tracked yet" }, { status: 400 })
    }

    const suggestions = await suggestNetworkingTargets(
      universities,
      profile.targetDegreeField,
      researchInterests
    )

    return NextResponse.json(suggestions)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
