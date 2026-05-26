"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Zap, CalendarDays, CheckCircle2, Circle, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn, urgencyColor } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { DailyTask, UserProfile } from "@/types"
import { format, isToday, isPast, getYear } from "date-fns"
import { computePhases, getCurrentPhase } from "@/lib/planner-logic"
import { fetchJson } from "@/lib/api"

const PHASES = [
  { id: "all", label: "All Tasks" },
  { id: "pre-application", label: "Pre-App" },
  { id: "shortlisting", label: "Shortlisting" },
  { id: "applications", label: "Applications" },
  { id: "visa-finance", label: "Visa & Finance" },
]

const CATEGORIES = [
  { value: "test-prep", label: "Test Prep" },
  { value: "research", label: "Research" },
  { value: "sop", label: "SOP" },
  { value: "application", label: "Application" },
  { value: "networking", label: "Networking" },
  { value: "financial", label: "Financial" },
]

export default function PlannerPage() {
  const [phase, setPhase] = useState("all")
  const [addOpen, setAddOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: tasks = [], isLoading } = useQuery<DailyTask[]>({
    queryKey: ["tasks"],
    queryFn: () => fetchJson<DailyTask[]>("/api/planner"),
  })

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: () => fetchJson<UserProfile>("/api/profile"),
  })

  // Detect if generated tasks are stale relative to current profile year
  const tasksAreStale = (() => {
    if (!profile || tasks.length === 0) return false
    const generated = tasks.filter((t) => t.isGenerated)
    if (generated.length === 0) return false
    const phases = computePhases(profile.targetSemester, profile.targetYear)
    const expectedStart = phases[0].startDate.getFullYear()
    const actualYear = getYear(new Date(generated[0].dueDate))
    return Math.abs(actualYear - expectedStart) > 0
  })()

  const currentPhase = profile
    ? getCurrentPhase(computePhases(profile.targetSemester, profile.targetYear))
    : null

  const toggleMutation = useMutation({
    mutationFn: (task: DailyTask) =>
      fetch(`/api/planner/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/planner/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })

  const [form, setForm] = useState({
    title: "", description: "", category: "research", phase: "pre-application", dueDate: "", urgency: "medium",
  })

  const addMutation = useMutation({
    mutationFn: (data: typeof form) =>
      fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      setAddOpen(false)
      setForm({ title: "", description: "", category: "research", phase: "pre-application", dueDate: "", urgency: "medium" })
      toast({ title: "Task added!" })
    },
  })

  const generateTasks = async () => {
    if (!profile) {
      toast({ title: "Set your target intake first", description: "Go to Settings and save your profile.", variant: "destructive" })
      return
    }
    setGenerating(true)
    try {
      await fetch("/api/planner/generate", { method: "POST" })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast({ title: "Plan generated!", description: `Tailored for ${profile.targetSemester} ${profile.targetYear} intake.` })
    } catch {
      toast({ title: "Error generating tasks", variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  const filtered = phase === "all" ? tasks : tasks.filter((t) => t.phase === phase)
  const completed = filtered.filter((t) => t.completed).length

  const groupByDate = (tasks: DailyTask[]) => {
    const groups: Record<string, DailyTask[]> = {}
    tasks.forEach((t) => {
      const key = format(new Date(t.dueDate), "yyyy-MM-dd")
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }

  const grouped = groupByDate(filtered)

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Daily Planner"
        description={
          profile
            ? `${profile.targetSemester} ${profile.targetYear} intake · ${completed}/${tasks.length} tasks completed`
            : `${completed}/${tasks.length} tasks completed`
        }
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generateTasks} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Generate Plan
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4" /> Add Task</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task title" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Phase</Label>
                      <Select value={form.phase} onValueChange={(v) => setForm((f) => ({ ...f, phase: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PHASES.slice(1).map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Due Date</Label>
                      <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Urgency</Label>
                      <Select value={form.urgency} onValueChange={(v) => setForm((f) => ({ ...f, urgency: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["low", "medium", "high", "critical"].map((u) => <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button onClick={() => addMutation.mutate(form)} disabled={!form.title || !form.dueDate || addMutation.isPending}>
                    {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Task"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-7 space-y-5 animate-fade-in">
        {/* Stale-plan warning */}
        {tasksAreStale && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Your plan may be outdated — profile was updated to <strong>{profile?.targetSemester} {profile?.targetYear}</strong>. Regenerate to sync.</span>
            <Button size="sm" variant="outline" className="ml-auto shrink-0 border-amber-500/30 text-amber-400 hover:bg-amber-500/10" onClick={generateTasks} disabled={generating}>
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />} Regenerate
            </Button>
          </div>
        )}

        {/* Current phase indicator */}
        {currentPhase && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Current phase: <span className={cn("font-medium", currentPhase.color)}>{currentPhase.label}</span></span>
            <span className="text-muted-foreground/50">
              · {format(currentPhase.startDate, "MMM d, yyyy")} – {format(currentPhase.endDate, "MMM d, yyyy")}
            </span>
          </div>
        )}

        <Tabs value={phase} onValueChange={setPhase}>
          <TabsList>
            {PHASES.map((p) => (
              <TabsTrigger key={p.id} value={p.id}>{p.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={phase} className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <CalendarDays className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No tasks in this phase</p>
                <Button size="sm" variant="outline" onClick={generateTasks}>
                  <Zap className="w-4 h-4" /> Auto-generate
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {grouped.map(([dateKey, dayTasks]) => {
                  const date = new Date(dateKey + "T00:00:00")
                  const isOverdue = isPast(date) && !isToday(date)
                  return (
                    <div key={dateKey}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          "text-xs font-semibold",
                          isToday(date) ? "text-primary" : isOverdue ? "text-red-400" : "text-muted-foreground"
                        )}>
                          {isToday(date) ? "Today" : format(date, "EEE, MMM d, yyyy")}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-muted-foreground">
                          {dayTasks.filter((t) => t.completed).length}/{dayTasks.length}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border border-border bg-card transition-all duration-150 group hover:border-primary/20",
                              task.completed && "opacity-50"
                            )}
                          >
                            <button onClick={() => toggleMutation.mutate(task)} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                              {task.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-medium truncate", task.completed && "line-through")}>{task.title}</p>
                              {task.description && <p className="text-xs text-muted-foreground truncate">{task.description}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className={cn("text-[10px]", urgencyColor(task.urgency))}>
                                {task.urgency}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {task.category}
                              </span>
                              <button
                                onClick={() => deleteMutation.mutate(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
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
