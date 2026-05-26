"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Circle, CalendarDays, ArrowRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { DailyTask } from "@/types"
import { format, isToday, addDays } from "date-fns"
import Link from "next/link"

interface TodayChecklistProps {
  tasks: DailyTask[]
  loading?: boolean
}

const URGENCY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high:     "bg-amber-500",
  medium:   "bg-sky-500",
  low:      "bg-zinc-400",
}

const CATEGORY_COLORS: Record<string, string> = {
  "test-prep":   "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  "research":    "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  "sop":         "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "application": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "networking":  "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30",
  "financial":   "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
}

const CATEGORY_LABEL: Record<string, string> = {
  "test-prep":   "Test Prep",
  "research":    "Research",
  "sop":         "SOP",
  "application": "Application",
  "networking":  "Networking",
  "financial":   "Financial",
}

export function TodayChecklist({ tasks, loading }: TodayChecklistProps) {
  const queryClient = useQueryClient()

  const upcoming = tasks
    .filter((t) => !t.completed && new Date(t.dueDate) <= addDays(new Date(), 3))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 9)

  const todayAll  = tasks.filter((t) => isToday(new Date(t.dueDate)))
  const todayDone = todayAll.filter((t) => t.completed).length
  const progress  = todayAll.length > 0 ? (todayDone / todayAll.length) * 100 : 0

  const toggleMutation = useMutation({
    mutationFn: async (task: DailyTask) => {
      const res = await fetch(`/api/planner/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })

  if (loading) {
    return (
      <div className="bento-card overflow-hidden flex flex-col h-full">
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bento-card overflow-hidden flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-border/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="section-label">Upcoming tasks</span>
        </div>
        <div className="flex items-center gap-4">
          {todayAll.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{todayDone}</span>
              <span className="text-muted-foreground/60">/{todayAll.length} today</span>
            </span>
          )}
          <Link
            href="/planner"
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            All tasks <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {todayAll.length > 0 && (
        <div className="shrink-0 h-[3px] bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* ── Task list ── */}
      {upcoming.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No pending tasks in the next 3 days</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col divide-y divide-border">
            {upcoming.map((task) => {
              const catColor = CATEGORY_COLORS[task.category]
              return (
                <button
                  key={task.id}
                  onClick={() => toggleMutation.mutate(task)}
                  disabled={toggleMutation.isPending}
                  className={cn(
                    "group flex items-center gap-3 px-5 py-3 text-left",
                    "transition-colors duration-75",
                    "hover:bg-accent",
                    task.completed && "opacity-40"
                  )}
                >
                  {/* Checkbox */}
                  <span className="shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors">
                    {task.completed
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : <Circle className="w-4 h-4" />
                    }
                  </span>

                  {/* Content */}
                  <span className="flex-1 min-w-0">
                    <span className={cn(
                      "block text-[13px] font-semibold leading-snug truncate",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </span>
                    <span className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-muted-foreground/60 font-medium">
                        {isToday(new Date(task.dueDate)) ? "Today" : format(new Date(task.dueDate), "MMM d")}
                      </span>
                      {CATEGORY_LABEL[task.category] && (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                          catColor ?? "bg-muted border-border text-muted-foreground"
                        )}>
                          {CATEGORY_LABEL[task.category]}
                        </span>
                      )}
                    </span>
                  </span>

                  {/* Urgency dot */}
                  {task.urgency !== "low" && (
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      URGENCY_DOT[task.urgency] ?? "bg-zinc-400"
                    )} />
                  )}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
