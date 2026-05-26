"use client"
import { DollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import type { Expense } from "@/types"

const CATEGORIES = [
  { id: "application-fee", label: "App Fees",  bar: "bg-violet-500", text: "text-violet-500 dark:text-violet-400" },
  { id: "test-prep",       label: "Test Prep",  bar: "bg-sky-500",    text: "text-sky-600 dark:text-sky-400"      },
  { id: "visa",            label: "Visa",       bar: "bg-amber-500",  text: "text-amber-600 dark:text-amber-400"  },
  { id: "tuition",         label: "Tuition",    bar: "bg-emerald-500",text: "text-emerald-600 dark:text-emerald-400"},
  { id: "misc",            label: "Other",      bar: "bg-zinc-500",   text: "text-zinc-500 dark:text-zinc-400"    },
]

interface CostSummaryProps {
  expenses: Expense[]
  loading?: boolean
}

export function CostSummary({ expenses, loading }: CostSummaryProps) {
  if (loading) {
    return (
      <div className="bento-card overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border/50">
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <div className="p-5 space-y-3">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-2 w-full rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  const total   = expenses.reduce((s, e) => s + e.amount, 0)
  const paid    = expenses.filter((e) => e.isPaid).reduce((s, e) => s + e.amount, 0)
  const paidPct = total > 0 ? (paid / total) * 100 : 0

  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    total: expenses.filter((e) => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
    pct:   total > 0
      ? (expenses.filter((e) => e.category === cat.id).reduce((s, e) => s + e.amount, 0) / total) * 100
      : 0,
  })).filter((c) => c.total > 0)

  return (
    <div className="bento-card overflow-hidden flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-border/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="section-label">Cost summary</span>
        </div>
        <Link
          href="/finances"
          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          Details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Total */}
        <div>
          <div className="text-[36px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 leading-none">
            {formatCurrency(total)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1.5">
            <span className="font-semibold text-foreground">{formatCurrency(paid)}</span> paid
            {total > 0 && <span className="ml-1 opacity-50">· {Math.round(paidPct)}%</span>}
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="h-2 bg-muted rounded-sm border border-border overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${paidPct}%` }}
            />
          </div>
        )}

        {/* Category breakdown */}
        {byCategory.length > 0 ? (
          <div className="flex flex-col gap-2.5 flex-1">
            {byCategory.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-sm shrink-0 ${cat.bar}`} />
                <span className="text-[12px] text-muted-foreground flex-1 truncate font-medium">{cat.label}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-14 h-1.5 bg-muted/60 rounded-sm overflow-hidden">
                    <div
                      className={`h-full rounded-sm ${cat.bar}`}
                      style={{ width: `${Math.min(cat.pct, 100)}%` }}
                    />
                  </div>
                  <span className={`text-[12px] font-semibold tabular-nums w-16 text-right ${cat.text}`}>
                    {formatCurrency(cat.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-4">
            <p className="text-xs font-medium text-muted-foreground/40">No expenses yet</p>
            <Link href="/finances" className="text-[11px] text-primary hover:underline font-medium">
              Track your first expense →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
