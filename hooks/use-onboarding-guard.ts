"use client"
import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"

/** Pages that never need a profile check */
const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/onboarding"]

/**
 * On every navigation to a protected page, checks /api/profile.
 * If the server returns 404 (no profile yet), redirects to /onboarding.
 * Uses a plain fetch — no TanStack Query dependency — so it fires
 * immediately and doesn't depend on cache state.
 */
export function useOnboardingGuard() {
  const { isSignedIn, isLoaded } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const checking = useRef(false)

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  useEffect(() => {
    // Wait for Clerk to hydrate
    if (!isLoaded || !isSignedIn) return
    // Skip public / auth pages
    if (isPublic) return
    // Prevent concurrent checks
    if (checking.current) return

    checking.current = true

    fetch("/api/profile")
      .then(async (res) => {
        if (res.status === 404) {
          // No profile yet — first-time user
          router.replace("/onboarding")
          return
        }
        if (res.ok) {
          const profile = await res.json()
          if (profile && !profile.isOnboarded) {
            // Profile exists but onboarding wasn't finished
            router.replace("/onboarding")
          }
        }
      })
      .catch(() => {
        // Network errors — don't redirect, let the page handle it
      })
      .finally(() => {
        checking.current = false
      })
  // Re-run whenever the user navigates to a new protected page
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, pathname])
}
