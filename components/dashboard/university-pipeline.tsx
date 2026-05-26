"use client"
import Link from "next/link"
import { ArrowRight, Building2, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatDeadline } from "@/lib/utils"
import type { University } from "@/types"

const COLUMNS = [
  {
    id:         "researching",
    label:      "Researching",
    headerText: "text-sky-600 dark:text-sky-400",
    headerBg:   "bg-sky-500/[0.07] dark:bg-sky-500/[0.08]",
    accent:     "border-l-[3px] border-l-sky-400/70",
    dot:        "bg-sky-500",
  },
  {
    id:         "applied",
    label:      "Applied",
    headerText: "text-violet-600 dark:text-violet-400",
    headerBg:   "bg-violet-500/[0.07] dark:bg-violet-500/[0.08]",
    accent:     "border-l-[3px] border-l-violet-400/70",
    dot:        "bg-violet-500",
  },
  {
    id:         "interview",
    label:      "Interview",
    headerText: "text-amber-600 dark:text-amber-400",
    headerBg:   "bg-amber-500/[0.07] dark:bg-amber-500/[0.08]",
    accent:     "border-l-[3px] border-l-amber-400/70",
    dot:        "bg-amber-500",
  },
  {
    id:         "accepted",
    label:      "Accepted",
    headerText: "text-emerald-600 dark:text-emerald-400",
    headerBg:   "bg-emerald-500/[0.07] dark:bg-emerald-500/[0.08]",
    accent:     "border-l-[3px] border-l-emerald-400/70",
    dot:        "bg-emerald-500",
  },
]

interface UniversityPipelineProps {
  universities: University[]
  loading?: boolean
}

export function UniversityPipeline({ universities, loading }: UniversityPipelineProps) {
  if (loading) {
    return (
      <div className="bento-card p-5">
        <Skeleton className="h-4 w-36 mb-5 rounded" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  const total = universities.length

  return (
    <div className="bento-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="section-label">Application pipeline</span>
          {total > 0 && (
            <span className="section-label ml-1 text-muted-foreground/40">
              · {total} program{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <Link
          href="/universities"
          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          Manage <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 divide-x divide-border/40">
        {COLUMNS.map((col) => {
          const items = universities.filter((u) => u.applicationStatus === col.id)
          return (
            <div key={col.id} className="flex flex-col">
              {/* Column header — tinted glass */}
              <div className={`flex items-center justify-between px-3 py-2.5 ${col.headerBg} border-b border-border/30`}>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                  <span className={`text-[11px] font-semibold tracking-wide ${col.headerText}`}>
                    {col.label}
                  </span>
                </div>
                <span className={`text-[11px] font-semibold tabular-nums ${col.headerText} opacity-70`}>
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-1.5 p-2.5 min-h-[100px]">
                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-5 rounded-lg border border-dashed border-border/40 text-muted-foreground/25">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">Empty</span>
                  </div>
                ) : (
                  items.slice(0, 4).map((u) => (
                    <Link key={u.id} href={`/universities/${u.id}`}>
                      <div className={cn(
                        "rounded-lg border border-border/40 px-3 py-2 cursor-pointer group",
                        "bg-white/40 dark:bg-white/[0.02]",
                        "hover:bg-white/70 dark:hover:bg-white/[0.05]",
                        "transition-all duration-150",
                        col.accent,
                      )}>
                        <p className="text-[12px] font-semibold truncate leading-snug group-hover:text-primary transition-colors">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                          {u.programName}
                        </p>
                        {u.regularDeadline && (
                          <p className="text-[10px] text-muted-foreground/40 mt-1 font-mono">
                            {formatDeadline(u.regularDeadline)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))
                )}
                {items.length > 4 && (
                  <Link
                    href="/universities"
                    className="text-[10px] font-medium text-muted-foreground/40 hover:text-primary px-1 transition-colors"
                  >
                    +{items.length - 4} more
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

