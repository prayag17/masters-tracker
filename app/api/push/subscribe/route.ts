import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionProfile } from "@/lib/session"

export async function POST(req: Request) {
  const result = await getSessionProfile()
  if (result.error) return result.error

  try {
    const { endpoint, keys, userAgent } = await req.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 })
    }

    await prisma.pushSubscription.upsert({
      where:  { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth, userAgent: userAgent ?? null },
      create: {
        endpoint,
        p256dh:    keys.p256dh,
        auth:      keys.auth,
        userAgent: userAgent ?? null,
        profileId: result.profile.id,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Push subscribe error:", e)
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
  }
}
