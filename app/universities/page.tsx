"use client"
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Building2, Loader2, Globe, RefreshCw, ChevronsUpDown, Check } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { statusColor, formatDeadline, formatCurrency, cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { University } from "@/types"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { UNIVERSITIES, type UniversityEntry } from "@/lib/universities-data"
import { fetchJson } from "@/lib/api"

const addSchema = z.object({
  name: z.string().min(2),
  country: z.string().min(2),
  city: z.string().optional(),
  programName: z.string().min(2),
  department: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  websiteUrl: z.string().url().optional().or(z.literal("")),
})
type AddForm = z.infer<typeof addSchema>

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "researching", label: "Researching" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
]

export default function UniversitiesPage() {
  const [filter, setFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [scrapingId, setScrapingId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: universities = [], isLoading } = useQuery<University[]>({
    queryKey: ["universities"],
    queryFn: () => fetchJson<University[]>("/api/universities"),
  })

  const form = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: { priority: "medium", name: "", country: "", city: "", programName: "", department: "" },
  })

  const addMutation = useMutation({
    mutationFn: (data: AddForm) =>
      fetch("/api/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] })
      setOpen(false)
      form.reset()
      setSelectedEntry(null)
      toast({ title: "University added!" })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/universities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationStatus: status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["universities"] }),
  })

  const scrapeUniversity = async (uni: University) => {
    setScrapingId(uni.id)
    try {
      const res = await fetch(`/api/universities/${uni.id}/scrape`, { method: "POST" })
      const data = await res.json()
      queryClient.invalidateQueries({ queryKey: ["universities"] })
      toast({ title: "Scrape complete!", description: `Found deadline: ${data.regularDeadline ?? "N/A"}` })
    } catch {
      toast({ title: "Scrape failed", variant: "destructive" })
    } finally {
      setScrapingId(null)
    }
  }

  // ─── University combobox state ─────────────────────────────────────────────
  const [comboOpen, setComboOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<UniversityEntry | null>(null)

  const filteredUniversities = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return UNIVERSITIES
    return UNIVERSITIES.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q)
    )
  }, [search])

  const handleSelectUniversity = (entry: UniversityEntry) => {
    setSelectedEntry(entry)
    form.setValue("name", entry.name, { shouldValidate: true })
    form.setValue("country", entry.country, { shouldValidate: true })
    form.setValue("city", entry.city ?? "")
    form.setValue("websiteUrl", entry.websiteUrl ?? "")
    form.setValue("programName", "")
    form.setValue("department", "")
    setComboOpen(false)
    setSearch("")
  }

  const filtered = filter === "all" ? universities : universities.filter((u) => u.applicationStatus === filter)

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Universities"
        description={`${universities.length} programs tracked`}
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { form.reset(); setSelectedEntry(null); setSearch("") } }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4" /> Add University</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add University</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit((d) => addMutation.mutate(d))} className="space-y-4">

                {/* University combobox */}
                <div className="space-y-1.5">
                  <Label>University</Label>
                  <Popover open={comboOpen} onOpenChange={setComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboOpen}
                        className="w-full justify-between font-normal"
                      >
                        <span className={cn("truncate", !selectedEntry && "text-muted-foreground")}>
                          {selectedEntry ? selectedEntry.name : "Select university…"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[380px] p-0" align="start">
                      <div className="p-2 border-b border-border">
                        <Input
                          autoFocus
                          placeholder="Search universities…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <ScrollArea className="h-60">
                        {filteredUniversities.length === 0 ? (
                          <p className="p-3 text-xs text-muted-foreground text-center">No results.</p>
                        ) : (
                          <div className="p-1">
                            {filteredUniversities.map((entry) => (
                              <button
                                key={entry.name}
                                type="button"
                                onClick={() => handleSelectUniversity(entry)}
                                className={cn(
                                  "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                                  selectedEntry?.name === entry.name && "bg-primary/10 text-primary"
                                )}
                              >
                                <Check
                                  className={cn("h-3.5 w-3.5 shrink-0", selectedEntry?.name === entry.name ? "opacity-100" : "opacity-0")}
                                />
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{entry.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{entry.city ? `${entry.city}, ` : ""}{entry.country}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Program selector — only visible after university is chosen */}
                {selectedEntry && (
                  <div className="space-y-1.5">
                    <Label>Program</Label>
                    <Controller
                      control={form.control}
                      name="programName"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            const prog = selectedEntry.programs.find((p) => p.programName === v)
                            field.onChange(v)
                            form.setValue("department", prog?.department ?? "")
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select program…" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedEntry.programs.map((p) => (
                              <SelectItem key={p.programName} value={p.programName}>
                                {p.programName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.programName && (
                      <p className="text-xs text-destructive">{form.formState.errors.programName.message}</p>
                    )}
                  </div>
                )}

                {/* Auto-filled read-only info */}
                {selectedEntry && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground">Country</Label>
                      <Input value={form.watch("country")} readOnly className="bg-muted/30 text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground">City</Label>
                      <Input value={form.watch("city") ?? ""} readOnly className="bg-muted/30 text-muted-foreground" />
                    </div>
                  </div>
                )}

                {/* Priority + optional URL */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Controller
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Website (optional)</Label>
                    <Input
                      placeholder="https://…"
                      {...form.register("websiteUrl")}
                      className={selectedEntry?.websiteUrl ? "bg-muted/30 text-muted-foreground" : ""}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={addMutation.isPending || !selectedEntry}>
                    {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex-1 overflow-y-auto p-5 space-y-4 animate-fade-in">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                {t.value !== "all" && (
                  <span className="ml-1.5 text-[10px] text-muted-foreground">
                    {universities.filter((u) => u.applicationStatus === t.value).length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={filter}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <Building2 className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No universities yet</p>
                <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add one</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                {filtered.map((uni) => (
                  <UniversityCard
                    key={uni.id}
                    uni={uni}
                    isScraping={scrapingId === uni.id}
                    onScrape={() => scrapeUniversity(uni)}
                    onStatusChange={(status) => updateStatusMutation.mutate({ id: uni.id, status })}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function UniversityCard({
  uni,
  isScraping,
  onScrape,
  onStatusChange,
}: {
  uni: University
  isScraping: boolean
  onScrape: () => void
  onStatusChange: (status: string) => void
}) {
  const priorityCfg = {
    high:   { dot: "bg-red-500",   text: "text-red-600 dark:text-red-400",   ring: "border-red-400/30",   bg: "bg-red-500/10"   },
    medium: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", ring: "border-amber-400/30", bg: "bg-amber-500/10" },
    low:    { dot: "bg-zinc-500",  text: "text-zinc-600 dark:text-zinc-400",  ring: "border-zinc-400/30",  bg: "bg-zinc-500/10"  },
  }
  const pc = priorityCfg[uni.priority]

  const stats = [
    uni.regularDeadline    && { label: "Deadline",  value: formatDeadline(uni.regularDeadline) },
    uni.applicationFee     && { label: "App Fee",   value: formatCurrency(uni.applicationFee)  },
    uni.avgGREQuantitative && { label: "GRE Quant", value: String(uni.avgGREQuantitative)       },
    uni.avgTOEFL           && { label: "TOEFL",     value: String(uni.avgTOEFL)                },
  ].filter(Boolean) as { label: string; value: string }[]

  const statusAccent: Record<string, string> = {
    researching: "border-l-sky-500",
    applied:     "border-l-violet-500",
    interview:   "border-l-amber-500",
    accepted:    "border-l-emerald-500",
    rejected:    "border-l-red-500",
    waitlisted:  "border-l-orange-500",
  }

  return (
    <div className={cn("bento-card group flex flex-col gap-0 overflow-hidden border-l-[3px]", statusAccent[uni.applicationStatus])}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{uni.name}</h3>
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{uni.programName}</p>
          <p className="text-[10px] text-muted-foreground/45 flex items-center gap-1 mt-1">
            <Globe className="w-3 h-3" />
            {uni.city ? `${uni.city}, ` : ""}{uni.country}
          </p>
        </div>
        {/* Priority badge */}
        <span className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-medium shrink-0",
          pc.text, pc.ring, pc.bg
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", pc.dot)} />
          {uni.priority}
        </span>
      </div>

      {/* Stats grid */}
      {stats.length > 0 && (
        <div className={cn(
          "grid gap-0 text-[10px] border-t border-border/40 divide-x divide-border/40",
          stats.length >= 2 ? "grid-cols-2" : "grid-cols-1"
        )}>
          {stats.map((s) => (
            <div key={s.label} className="bg-muted/20 p-2.5">
              <p className="text-muted-foreground/50 mb-0.5 font-medium text-[9px]">{s.label}</p>
              <p className="font-semibold text-foreground/80 text-[12px]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 p-3 border-t border-border/40 mt-auto">
        <Select value={uni.applicationStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["researching", "applied", "interview", "accepted", "rejected", "waitlisted"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={onScrape}
          disabled={isScraping}
          className="h-7 px-2.5 shrink-0 text-xs"
          title="Scrape admission data"
        >
          {isScraping
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <RefreshCw className="w-3 h-3" />
          }
        </Button>
      </div>
    </div>
  )
}
