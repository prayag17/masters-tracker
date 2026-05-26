import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionProfile } from "@/lib/session"

export async function GET() {
  const result = await getSessionProfile()
  if (result.error) return result.error

  const tasks = await prisma.dailyTask.findMany({
    where:   { profileId: result.profile.id },
    orderBy: [{ dueDate: "asc" }, { urgency: "asc" }],
  })
  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  try {
    const body = await req.json()
    const task = await prisma.dailyTask.create({
      data: {
        title:       body.title,
        description: body.description ?? null,
        phase:       body.phase,
        category:    body.category,
        dueDate:     new Date(body.dueDate),
        urgency:     body.urgency ?? "medium",
        isGenerated: body.isGenerated ?? false,
        profileId:   result.profile.id,
      },
    })
    return NextResponse.json(task)
  } catch (e) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
