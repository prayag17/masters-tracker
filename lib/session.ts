/**
 * lib/session.ts
 * Shared helper used by all API route handlers to:
 *   1. Verify the Clerk session
 *   2. Return the user's UserProfile row (or null if not onboarded yet)
 *
 * Usage in a route:
 *   const { profile, userId, error } = await getSessionProfile()
 *   if (error) return error          // already a NextResponse 401/404
 */
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { UserProfile } from "@prisma/client"

interface SessionResult {
  userId: string
  profile: UserProfile
  error?: never
}

interface SessionError {
  userId?: never
  profile?: never
  error: NextResponse
}

export async function getSessionProfile(): Promise<SessionResult | SessionError> {
  const { userId } = await auth()

  if (!userId) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  })

  if (!profile) {
    return {
      error: NextResponse.json({ error: "Profile not found — complete onboarding first" }, { status: 404 }),
    }
  }

  return { userId, profile }
}

/**
 * Lighter version — returns userId only (for onboarding routes where
 * the profile might not exist yet).
 */
export async function getAuthUserId(): Promise<{ userId: string } | { error: NextResponse }> {
  const { userId } = await auth()
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { userId }
}
