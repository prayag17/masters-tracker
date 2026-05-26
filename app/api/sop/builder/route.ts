import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateSOPInsights } from "@/lib/llm"

export async function POST(req: Request) {
  try {
    const profile = await prisma.userProfile.findFirst()
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 })

    const body = await req.json()
    const { universityName, programName } = body as { universityName: string; programName: string }

    if (!universityName || !programName) {
      return NextResponse.json({ error: "universityName and programName are required" }, { status: 400 })
    }

    const userBackground = `Undergraduate major: ${profile.undergraduateMajor}. Target degree: ${profile.targetDegreeField}. GPA: ${profile.currentGPA}/${profile.maxGPA}.`

    const insights = await generateSOPInsights(
      universityName,
      programName,
      profile.targetDegreeField,
      userBackground
    )

    return NextResponse.json(insights)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
