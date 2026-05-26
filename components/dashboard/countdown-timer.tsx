"use client"
import { useEffect, useState } from "react"
import { differenceInDays, differenceInHours, format } from "date-fns"
import { CalendarClock, Target, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  deadline: { university: string; deadline: Date; label: string } | null
  loading?: boolean
}

/* Decorative orbital rings — faint background graphic */
function OrbitalSvg() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
      <circle cx="80" cy="80" r="54" stroke="currentColor" strokeWidth="1" />
      <circle cx="80" cy="80" r="36" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" />
      <circle cx="80" cy="80" r="18" stroke="currentColor" strokeWidth="1" />
      <circle cx="80" cy="80" r="4" fill="currentColor" />
      {/* Orbit dot */}
      <circle cx="134" cy="80" r="5" fill="currentColor" />
      <circle cx="26"  cy="80" r="3" fill="currentColor" fillOpacity="0.5" />
      <circle cx="80"  cy="26" r="3" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

export function CountdownTimer({ deadline, loading }: CountdownTimerProps) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="bento-card p-6 flex flex-col gap-4">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-20 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-40 rounded" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    )
  }

  if (!deadline) {
    return (
      <div className="bento-card relative overflow-hidden p-6 flex flex-col items-center justify-center gap-4 text-center min-h-[220px]">
        <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center">
          <CalendarClock className="w-5 h-5 text-muted-foreground/50" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground/50">No deadlines yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add universities to start tracking</p>
        </div>
      </div>
    )
  }

  const days     = differenceInDays(deadline.deadline, new Date())
  const hours    = differenceInHours(deadline.deadline, new Date()) % 24
  const mins     = Math.abs(new Date().getMinutes() - deadline.deadline.getMinutes())
  const isUrgent  = days <= 14
  const isOverdue = days < 0

  const dayColor   = isOverdue
    ? "text-red-500 dark:text-red-400"
    : isUrgent
    ? "text-amber-500 dark:text-amber-400"
    : "text-primary"

  const badgeColor = isOverdue
    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
    : isUrgent
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    : "bg-primary/10 text-primary border-primary/20"

  const orbitalColor = isOverdue
    ? "text-red-500"
    : isUrgent
    ? "text-amber-500"
    : "text-primary"

  return (
    <div className="bento-card relative overflow-hidden flex flex-col h-full">

      {/* Background orbital SVG */}
      <div className={cn(
        "absolute -right-8 -top-8 w-44 h-44 opacity-[0.06] pointer-events-none select-none",
        orbitalColor
      )}>
        <OrbitalSvg />
      </div>

      {/* Top section — the hero countdown */}
      <div className="relative p-5 flex-1">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <span className="section-label flex items-center gap-1.5">
            <Target className="w-3 h-3" />
            Next deadline
          </span>
          <span className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-md border leading-none",
            badgeColor
          )}>
            {deadline.label}
          </span>
        </div>

        {/* Big day number */}
        <div className="flex items-end gap-3">
          <div>
            <span className={cn(
              "text-[80px] font-bold tabular-nums leading-none tracking-tighter",
              dayColor
            )}>
              {Math.abs(days)}
            </span>
          </div>

          {/* Sub-units */}
          <div className="flex flex-col gap-1.5 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-semibold tabular-nums text-muted-foreground/60 leading-none">
                {String(Math.abs(hours)).padStart(2, "0")}
              </span>
              <span className="section-label">hr</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-semibold tabular-nums text-muted-foreground/35 leading-none">
                {String(mins).padStart(2, "0")}
              </span>
              <span className="section-label">min</span>
            </div>
          </div>
        </div>

        <p className={cn("text-xs font-medium tracking-wide mt-1", dayColor)}>
          {isOverdue ? "days overdue" : "days remaining"}
        </p>
      </div>

      {/* University info strip */}
      <div className="border-t border-border/50 px-5 py-3.5 flex items-center gap-3">
        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold truncate leading-none">{deadline.university}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {format(deadline.deadline, "EEEE, MMM d, yyyy")}
          </p>
        </div>
      </div>
    </div>
  )
}
