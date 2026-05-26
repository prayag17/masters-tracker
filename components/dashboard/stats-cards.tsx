"use client"
import { Building2, Users, CheckCircle2, DollarSign } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

interface StatsCardsProps {
  stats: {
    totalUniversities: number
    appliedCount: number
    networkingContacts: number
    totalExpenses: number
  } | null
  loading?: boolean
}

const STAT_ITEMS = [
  {
    key:        "totalUniversities" as const,
    label:      "Universities",
    sub:        "tracked",
    icon:       Building2,
    color:      "text-orange-600 dark:text-orange-400",
    iconColor:  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    stripColor: "bg-orange-500",
    format:     (v: number) => v.toString(),
  },
  {
    key:        "appliedCount" as const,
    label:      "Applied",
    sub:        "programs",
    icon:       CheckCircle2,
    color:      "text-emerald-600 dark:text-emerald-400",
    iconColor:  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    stripColor: "bg-emerald-500",
    format:     (v: number) => v.toString(),
  },
  {
    key:        "networkingContacts" as const,
    label:      "Contacts",
    sub:        "networking",
    icon:       Users,
    color:      "text-sky-600 dark:text-sky-400",
    iconColor:  "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    stripColor: "bg-sky-500",
    format:     (v: number) => v.toString(),
  },
  {
    key:        "totalExpenses" as const,
    label:      "Budget",
    sub:        "total spent",
    icon:       DollarSign,
    color:      "text-rose-600 dark:text-rose-400",
    iconColor:  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    stripColor: "bg-rose-500",
    format:     (v: number) => formatCurrency(v),
  },
]

export function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon
        const value = stats ? item.format(stats[item.key]) : null

        return (
          <div key={item.key} className="bento-card relative overflow-hidden p-5 flex flex-col gap-3 min-h-[110px]">
            {/* Colored top accent strip */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${item.stripColor} opacity-70`} />

            {/* Top row */}
            <div className="flex items-center justify-between pt-1">
              <span className="section-label">{item.label}</span>
              <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${item.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Metric */}
            {loading ? (
              <Skeleton className="h-9 w-20 rounded-lg" />
            ) : (
              <div>
                <div className={`text-[30px] font-bold tabular-nums leading-none tracking-tight ${item.color}`}>
                  {value ?? "—"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1.5">
                  {item.sub}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
