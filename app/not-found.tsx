import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">

      {/* Illustration */}
      <div className="relative mb-6 opacity-70">
        <svg viewBox="0 0 160 120" width="200" className="text-muted-foreground/30" fill="none">
          {/* Mortarboard */}
          <path d="M40 52 L80 32 L120 52 L80 72 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="80" y1="72" x2="80" y2="92" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M56 61 L56 82 A24 24 0 0 0 104 82 L104 61" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Question mark */}
          <text x="138" y="28" fill="currentColor" fontSize="36" fontWeight="bold" opacity="0.5">?</text>
        </svg>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 mb-4">
        <span className="text-2xl font-black text-muted-foreground/40 tabular-nums tracking-tighter">404</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
        This page doesn&apos;t exist or was moved. Let&apos;s get you back on track.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          ← Back to Dashboard
        </Link>
        <Link
          href="/universities"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background/60 text-foreground text-sm font-medium hover:bg-accent transition-colors"
        >
          Universities
        </Link>
      </div>
    </div>
  )
}
