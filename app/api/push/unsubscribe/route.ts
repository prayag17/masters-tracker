import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionProfile } from "@/lib/session"

export async function POST(req: Request) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  const { endpoint } = await req.json()
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 })

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, profileId: result.profile.id },
  })

  return NextResponse.json({ ok: true })
}
