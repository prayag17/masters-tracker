"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Loader2, DollarSign, CheckCircle2, Circle } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { Expense } from "@/types"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { fetchJson } from "@/lib/api"

const EXPENSE_CATEGORIES = [
  { value: "application-fee", label: "Application Fee", color: "bg-violet-400" },
  { value: "test-prep", label: "Test Prep", color: "bg-blue-400" },
  { value: "visa", label: "Visa", color: "bg-amber-400" },
  { value: "tuition", label: "Tuition", color: "bg-emerald-400" },
  { value: "living", label: "Living", color: "bg-cyan-400" },
  { value: "travel", label: "Travel", color: "bg-orange-400" },
  { value: "misc", label: "Miscellaneous", color: "bg-zinc-400" },
]

export default function FinancesPage() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: () => fetchJson<Expense[]>("/api/finances"),
  })

  const [form, setForm] = useState({
    category: "application-fee",
    description: "",
    amount: "",
    currency: "USD",
    date: new Date().toISOString().split("T")[0],
    isPaid: false,
    notes: "",
  })

  const addMutation = useMutation({
    mutationFn: (data: typeof form) =>
      fetch("/api/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: parseFloat(data.amount) }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      setOpen(false)
      setForm({ category: "application-fee", description: "", amount: "", currency: "USD", date: new Date().toISOString().split("T")[0], isPaid: false, notes: "" })
      toast({ title: "Expense added!" })
    },
  })

  const togglePaidMutation = useMutation({
    mutationFn: (expense: Expense) =>
      fetch(`/api/finances/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: !expense.isPaid }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  })

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const paid = expenses.filter((e) => e.isPaid).reduce((s, e) => s + e.amount, 0)
  const unpaid = total - paid

  const categoryBreakdown = EXPENSE_CATEGORIES.map((cat) => {
    const catExpenses = expenses.filter((e) => e.category === cat.value)
    const catTotal = catExpenses.reduce((s, e) => s + e.amount, 0)
    return { ...cat, total: catTotal, count: catExpenses.length }
  }).filter((c) => c.total > 0)

  const filtered = filter === "all" ? expenses : expenses.filter((e) => e.category === filter)

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Financial Tracker"
        description="Track application costs, visa fees, and estimated expenses"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4" /> Add Expense</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="GRE registration fee" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Amount</Label>
                    <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="250" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["USD", "EUR", "GBP", "CAD", "AUD", "INR"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={form.isPaid ? "paid" : "unpaid"} onValueChange={(v) => setForm((f) => ({ ...f, isPaid: v === "paid" }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => addMutation.mutate(form)} disabled={!form.description || !form.amount || addMutation.isPending}>
                  {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex-1 overflow-y-auto p-7 space-y-5 animate-fade-in">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Budget", value: total, color: "text-foreground" },
            { label: "Paid", value: paid, color: "text-emerald-400" },
            { label: "Pending", value: unpaid, color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="bento-card text-center">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-xl font-bold tabular-nums ${s.color}`}>{formatCurrency(s.value)}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="bento-card">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Payment Progress</span>
            <span>{total > 0 ? Math.round((paid / total) * 100) : 0}% paid</span>
          </div>
          <Progress value={total > 0 ? (paid / total) * 100 : 0} className="h-2" />

          {/* Category breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="mt-4 space-y-2">
              {categoryBreakdown.map((cat) => (
                <div key={cat.value} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${cat.color} shrink-0`} />
                  <span className="text-xs text-muted-foreground flex-1">{cat.label}</span>
                  <span className="text-xs font-medium tabular-nums">{formatCurrency(cat.total)}</span>
                  <div className="w-24">
                    <Progress value={total > 0 ? (cat.total / total) * 100 : 0} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense table */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {EXPENSE_CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value}>{c.label}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={filter} className="mt-4">
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center">
                <DollarSign className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No expenses tracked yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => {
                  const cat = EXPENSE_CATEGORIES.find((c) => c.value === expense.category)
                  return (
                    <div key={expense.id} className="bento-card flex items-center gap-4">
                      <button onClick={() => togglePaidMutation.mutate(expense)} className="shrink-0">
                        {expense.isPaid
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          : <Circle className="w-5 h-5 text-muted-foreground/50 hover:text-primary transition-colors" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", expense.isPaid && "line-through opacity-60")}>{expense.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium ${cat?.color?.replace("bg-", "text-") ?? "text-zinc-400"}`}>{cat?.label}</span>
                          {expense.university && <span className="text-[10px] text-muted-foreground">· {expense.university.name}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold tabular-nums">{formatCurrency(expense.amount, expense.currency)}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(expense.date), "MMM d, yyyy")}</p>
                      </div>
                      {expense.isPaid
                        ? <Badge variant="success" className="shrink-0 text-[10px]">Paid</Badge>
                        : <Badge variant="warning" className="shrink-0 text-[10px]">Pending</Badge>}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
