import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { computePhases, generateTasks } from "@/lib/planner-logic"

export async function POST() {
  try {
    const profile = await prisma.userProfile.findFirst()
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 })

    const phases = computePhases(profile.targetSemester, profile.targetYear)
    const tasks = generateTasks(phases, profile.id)

    // Delete previously auto-generated tasks
    await prisma.dailyTask.deleteMany({
      where: { profileId: profile.id, isGenerated: true },
    })

    // Insert new generated tasks
    await prisma.dailyTask.createMany({ data: tasks })

    return NextResponse.json({ generated: tasks.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
