import { SignIn } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const FEATURES = [
  { emoji: "🎓", title: "Track every deadline", body: "Early action, regular, rolling — never miss a window." },
  { emoji: "📝", title: "SOP workshop", body: "AI evaluation + live keyword checking across every draft." },
  { emoji: "🌐", title: "Networking CRM", body: "Manage professor outreach with follow-up reminders." },
  { emoji: "💰", title: "Cost planner", body: "Application fees, visa, living — budgeted by category." },
]

export default async function SignInPage() {
  const { userId } = await auth()
  if (userId) redirect("/")
  return (
    <div className="min-h-screen flex">

      {/* ── Left branding panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(24 55% 15%) 0%, hsl(32 72% 32%) 55%, hsl(38 82% 50%) 100%)" }}>

        {/* dot-grid texture overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1.2' fill='white'/%3E%3C/svg%3E\")" }} />

        {/* large ghost cap */}
        <div className="absolute -right-16 -bottom-16 opacity-[0.06] pointer-events-none select-none">
          <svg viewBox="0 0 400 400" width="400" height="400" fill="none">
            <path d="M60 160 L200 80 L340 160 L200 240 Z" stroke="white" strokeWidth="6" />
            <line x1="200" y1="240" x2="200" y2="310" stroke="white" strokeWidth="12" strokeLinecap="round" />
            <path d="M130 202 L130 268 A70 70 0 0 0 270 268 L270 202" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="rgba(255,255,255,0.15)" />
              <rect width="28" height="28" rx="6" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
              <path d="M6 20V9L14 16.5L22 9V20" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white font-semibold text-[17px] tracking-tight">MastersTrack</span>
          </div>

          {/* Hero copy */}
          <div className="mt-auto mb-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80 text-xs font-medium">Application season 2025–26</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Your Masters<br />command centre
            </h1>
            <p className="mt-4 text-white/70 text-base leading-relaxed max-w-xs">
              Plan applications, track deadlines, polish your SOP and manage your budget — all in one place.
            </p>

            {/* Feature list */}
            <div className="mt-8 space-y-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">{f.emoji}</span>
                  <div>
                    <span className="text-white/95 text-sm font-medium">{f.title}</span>
                    <span className="text-white/55 text-sm"> — {f.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer quote */}
          <p className="text-white/30 text-xs">
            Join students navigating their Masters journey.
          </p>
        </div>
      </div>

      {/* ── Right auth panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="hsl(var(--primary))" />
            <path d="M6 20V9L14 16.5L22 9V20" stroke="hsl(var(--primary-foreground))" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold text-base">MastersTrack</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">Sign in to continue to your workspace</p>
          </div>
          <SignIn routing="path" path="/sign-in" />
        </div>
      </div>
    </div>
  )
}
