import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, differenceInDays, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDeadline(date: Date | string | null): string {
  if (!date) return "No deadline"
  const d = new Date(date)
  const days = differenceInDays(d, new Date())
  if (days < 0) return `Passed ${Math.abs(days)}d ago`
  if (days === 0) return "Today!"
  if (days <= 7) return `${days}d left`
  return format(d, "MMM d, yyyy")
}

export function daysUntil(date: Date | string | null): number | null {
  if (!date) return null
  return differenceInDays(new Date(date), new Date())
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}

export function urgencyColor(urgency: string): string {
  const map: Record<string, string> = {
    critical: "text-red-400 bg-red-400/10 border-red-400/20",
    high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    low: "text-green-400 bg-green-400/10 border-green-400/20",
  }
  return map[urgency] ?? map.medium
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    researching: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    applied: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    interview: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    accepted: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    rejected: "text-red-400 bg-red-400/10 border-red-400/20",
    waitlisted: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  }
  return map[status] ?? map.researching
}

export function contactStatusColor(status: string): string {
  const map: Record<string, string> = {
    "not-contacted": "text-zinc-400 bg-zinc-400/10",
    contacted: "text-blue-400 bg-blue-400/10",
    replied: "text-emerald-400 bg-emerald-400/10",
    "meeting-scheduled": "text-violet-400 bg-violet-400/10",
    "follow-up-needed": "text-amber-400 bg-amber-400/10",
  }
  return map[status] ?? "text-zinc-400 bg-zinc-400/10"
}

export function getClosestDeadline(
  universities: Array<{
    name: string
    regularDeadline: Date | null
    earlyActionDeadline: Date | null
    rollingDeadline: Date | null
  }>
): { university: string; deadline: Date; label: string } | null {
  const now = new Date()
  let closest: { university: string; deadline: Date; label: string } | null = null

  for (const u of universities) {
    const candidates = [
      { date: u.earlyActionDeadline, label: "Early Action" },
      { date: u.regularDeadline, label: "Regular Decision" },
      { date: u.rollingDeadline, label: "Rolling" },
    ]
    for (const c of candidates) {
      if (!c.date) continue
      const d = new Date(c.date)
      if (d < now) continue
      if (!closest || d < closest.deadline) {
        closest = { university: u.name, deadline: d, label: c.label }
      }
    }
  }

  return closest
}
