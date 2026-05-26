"use client"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"

/** Pages that render without the main app chrome (sidebar, etc.) */
const CHROMELESS_PATHS = ["/sign-in", "/sign-up", "/onboarding"]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const chromeless = CHROMELESS_PATHS.some((p) => pathname.startsWith(p))

  if (chromeless) {
    // Animate page entry for auth/onboarding pages too
    return <div key={pathname} className="animate-fade-in">{children}</div>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dots">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {/* key forces re-mount → triggers fade-in on every navigation */}
        <div key={pathname} className="flex-1 flex flex-col overflow-hidden animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
