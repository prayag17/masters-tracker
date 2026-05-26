import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionProfile } from "@/lib/session"

export async function GET() {
  const result = await getSessionProfile()
  if (result.error) return result.error

  const expenses = await prisma.expense.findMany({
    where:   { profileId: result.profile.id },
    include: { university: { select: { name: true } } },
    orderBy: { date: "desc" },
  })
  return NextResponse.json(expenses)
}

export async function POST(req: Request) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  try {
    const body = await req.json()
    const expense = await prisma.expense.create({
      data: {
        category:    body.category,
        description: body.description,
        amount:      body.amount,
        currency:    body.currency ?? "USD",
        date:        new Date(body.date),
        isPaid:      body.isPaid ?? false,
        notes:       body.notes ?? null,
        universityId: body.universityId ?? null,
        profileId:   result.profile.id,
      },
    })
    return NextResponse.json(expense)
  } catch {
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 })
  }
}
