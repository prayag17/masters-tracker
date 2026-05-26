import { SignUp } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const STEPS = [
  { n: "01", label: "Create account",    sub: "Email or Google" },
  { n: "02", label: "Tell us about you", sub: "5-min profile setup" },
  { n: "03", label: "Start tracking",    sub: "Add universities & tasks" },
]

export default async function SignUpPage() {
  const { userId } = await auth()
  if (userId) redirect("/")
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(24 55% 15%) 0%, hsl(32 72% 32%) 55%, hsl(38 82% 50%) 100%)" }}>

        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1.2' fill='white'/%3E%3C/svg%3E\")" }} />

        {/* Large ring decoration */}
        <div className="absolute -left-24 -top-24 opacity-[0.08] pointer-events-none">
          <svg viewBox="0 0 500 500" width="500" height="500" fill="none">
            <circle cx="250" cy="250" r="240" stroke="white" strokeWidth="1.5" strokeDasharray="8 10" />
            <circle cx="250" cy="250" r="170" stroke="white" strokeWidth="1" />
            <circle cx="250" cy="250" r="100" stroke="white" strokeWidth="1.5" strokeDasharray="4 6" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          <div className="flex items-center gap-3">
            <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="rgba(255,255,255,0.15)" />
              <rect width="28" height="28" rx="6" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
              <path d="M6 20V9L14 16.5L22 9V20" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white font-semibold text-[17px] tracking-tight">MastersTrack</span>
          </div>

          <div className="mt-auto mb-auto">
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-4">Get started free</p>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Build your<br />application story
            </h1>
            <p className="mt-4 text-white/70 text-base leading-relaxed max-w-xs">
              Set up your profile once. Let MastersTrack guide your entire journey from shortlisting to acceptance.
            </p>

            {/* Steps */}
            <div className="mt-10 space-y-5">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: i === 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.12)", color: i === 0 ? "hsl(256 65% 42%)" : "rgba(255,255,255,0.7)" }}>
                    {s.n}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${i === 0 ? "text-white" : "text-white/70"}`}>{s.label}</p>
                    <p className="text-white/45 text-xs">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-xs">No credit card required.</p>
        </div>
      </div>

      {/* ── Right auth panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="hsl(var(--primary))" />
            <path d="M6 20V9L14 16.5L22 9V20" stroke="hsl(var(--primary-foreground))" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold text-base">MastersTrack</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
            <p className="text-muted-foreground text-sm mt-1">Takes less than a minute</p>
          </div>
          <SignUp routing="path" path="/sign-up" />
        </div>
      </div>
    </div>
  )
}
