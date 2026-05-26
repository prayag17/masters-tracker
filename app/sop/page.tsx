"use client"
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus, Sparkles, Loader2, FileText, AlertCircle, CheckCircle2,
  Wand2, Copy, Check, ChevronDown, ChevronUp, PanelRight,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { SOPIteration, University } from "@/types"
import { cn } from "@/lib/utils"
import type { SOPBuilderInsights } from "@/lib/llm"
import { fetchJson } from "@/lib/api"

// ─── Live keyword checker ──────────────────────────────────────────────────
function useKeywordCheck(content: string, keywords: string[], avoidPhrases: string[]) {
  return useMemo(() => {
    const lower = content.toLowerCase()
    const present = keywords.filter((k) => lower.includes(k.toLowerCase()))
    const missing = keywords.filter((k) => !lower.includes(k.toLowerCase()))
    const found = avoidPhrases.filter((p) => lower.includes(p.toLowerCase()))
    return { present, missing, foundAvoid: found }
  }, [content, keywords, avoidPhrases])
}

// ─── Builder Panel ─────────────────────────────────────────────────────────
function BuilderPanel({
  universities,
  editorContent,
}: {
  universities: University[]
  editorContent: string
}) {
  const [selectedUniId, setSelectedUniId] = useState<string>("")
  const [insights, setInsights] = useState<SOPBuilderInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedTheme, setExpandedTheme] = useState<number | null>(null)
  const { toast } = useToast()

  const selectedUni = universities.find((u) => u.id === selectedUniId)
  const { present, missing, foundAvoid } = useKeywordCheck(
    editorContent,
    insights?.keywords ?? [],
    insights?.avoidPhrases ?? []
  )

  const generate = async () => {
    if (!selectedUni) return
    setLoading(true)
    setInsights(null)
    try {
      const res = await fetch("/api/sop/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityName: selectedUni.name, programName: selectedUni.programName }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data: SOPBuilderInsights = await res.json()
      setInsights(data)
    } catch {
      toast({ title: "Failed to generate insights", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {/* University selector */}
        <div className="space-y-2">
          <Label className="text-xs">Target University</Label>
          {universities.length === 0 ? (
            <p className="text-xs text-muted-foreground">No universities tracked yet. Add them in the Universities tab.</p>
          ) : (
            <Select value={selectedUniId} onValueChange={setSelectedUniId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select a tracked university…" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="text-xs">
                    <span className="font-medium">{u.name}</span>
                    <span className="text-muted-foreground ml-1.5">· {u.programName}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button
          className="w-full"
          size="sm"
          onClick={generate}
          disabled={!selectedUniId || loading}
        >
          {loading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analysing program…</>
          ) : (
            <><Wand2 className="w-3.5 h-3.5" /> Generate Insights</>
          )}
        </Button>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        )}

        {insights && (
          <>
            {/* ── Live keyword tracker ── */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Live Keyword Check · {editorContent.split(/\s+/).filter(Boolean).length} words
              </p>

              {/* Avoid-phrases found */}
              {foundAvoid.length > 0 && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 space-y-1">
                  <p className="text-[10px] font-medium text-red-400">⚠ Clichés found in your text</p>
                  <div className="flex flex-wrap gap-1">
                    {foundAvoid.map((p) => (
                      <Badge key={p} variant="outline" className="text-[10px] text-red-400 border-red-400/30">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Present keywords */}
              {present.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">✓ Present</p>
                  <div className="flex flex-wrap gap-1">
                    {present.map((k) => (
                      <Badge key={k} variant="outline" className="text-[10px] text-emerald-400 border-emerald-400/30">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords */}
              {missing.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">○ Missing</p>
                  <div className="flex flex-wrap gap-1">
                    {missing.map((k) => (
                      <Badge key={k} variant="outline" className="text-[10px] text-amber-400 border-amber-400/30">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* ── Theme alignments ── */}
            {insights.themeAlignments.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Theme Alignments
                </p>
                {insights.themeAlignments.map((t, i) => (
                  <div key={i} className="rounded-lg bg-muted/40 border border-border overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-2.5 text-left"
                      onClick={() => setExpandedTheme(expandedTheme === i ? null : i)}
                    >
                      <span className="text-xs font-medium text-primary">{t.theme}</span>
                      {expandedTheme === i
                        ? <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" />
                        : <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />}
                    </button>
                    {expandedTheme === i && (
                      <div className="px-2.5 pb-2.5 space-y-1.5 border-t border-border pt-2">
                        <p className="text-[10px] text-muted-foreground"><span className="text-foreground/70 font-medium">Why: </span>{t.why}</p>
                        <p className="text-[10px] text-muted-foreground"><span className="text-foreground/70 font-medium">How: </span>{t.how}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Opening hooks ── */}
            {insights.openingHooks.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Opening Hooks
                </p>
                {insights.openingHooks.map((hook, i) => (
                  <div key={i} className="group relative rounded-lg bg-muted/30 border border-border p-2.5">
                    <p className="text-[10px] text-muted-foreground leading-relaxed pr-6 italic">"{hook}"</p>
                    <button
                      onClick={() => copyText(hook, `hook-${i}`)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copied === `hook-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Why this program ── */}
            {insights.whyThisProgramAngles.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  "Why This Program" Angles
                </p>
                <ul className="space-y-1.5">
                  {insights.whyThisProgramAngles.map((angle, i) => (
                    <li key={i} className="flex gap-2 text-[10px] text-muted-foreground leading-relaxed">
                      <span className="text-primary mt-0.5 shrink-0">›</span>
                      {angle}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Research framing ── */}
            {insights.researchFraming.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Research Experience Framing
                </p>
                <ul className="space-y-1.5">
                  {insights.researchFraming.map((frame, i) => (
                    <li key={i} className="flex gap-2 text-[10px] text-muted-foreground leading-relaxed">
                      <span className="text-violet-400 mt-0.5 shrink-0">›</span>
                      {frame}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Career goal tie ── */}
            {insights.careerGoalTie && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Career Goals Tie-in
                </p>
                <div className="rounded-lg bg-primary/5 border border-primary/15 p-2.5">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{insights.careerGoalTie}</p>
                </div>
              </div>
            )}

            {/* ── Avoid phrases ── */}
            {insights.avoidPhrases.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Phrases to Avoid
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {insights.avoidPhrases.map((p) => (
                    <Badge
                      key={p}
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        foundAvoid.includes(p)
                          ? "text-red-400 border-red-400/30 bg-red-500/5"
                          : "text-muted-foreground"
                      )}
                    >
                      {foundAvoid.includes(p) && "⚠ "}{p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!insights && !loading && (
          <div className="text-center py-8 space-y-2">
            <Wand2 className="w-8 h-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs text-muted-foreground">Select a university and generate insights to get college-specific keywords, themes, and writing angles.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

// ─── Evaluation Panel ──────────────────────────────────────────────────────
function EvaluationPanel({ sop }: { sop: SOPIteration }) {
  const validator = sop.validatorOutput as Record<string, unknown> | null
  if (!validator) return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div>
        <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Click "Evaluate" to get AI feedback on this draft.</p>
      </div>
    </div>
  )

  const checklist = (validator.checklist as Array<{ item: string; status: string }>) ?? []
  const issues = (validator.criticalIssues as Array<{ priority: string; issue: string; recommendation: string }>) ?? []

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {/* Score */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Overall Score</span>
            <span className={cn(
              "font-bold",
              (sop.overallScore ?? 0) >= 7 ? "text-emerald-400" : (sop.overallScore ?? 0) >= 5 ? "text-amber-400" : "text-red-400"
            )}>
              {sop.overallScore?.toFixed(1)}/10
            </span>
          </div>
          <Progress value={(sop.overallScore ?? 0) * 10} />
        </div>

        {/* Verdict */}
        {!!validator.verdict && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-[10px] font-medium mb-1 text-muted-foreground uppercase tracking-wider">Verdict</p>
            <p className="text-xs text-muted-foreground">{String(validator.verdict)}</p>
          </div>
        )}

        {/* Checklist */}
        {checklist.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Checklist</p>
            <div className="space-y-1.5">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  {item.status === "PASS"
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    : <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                  <span className="text-[10px] text-muted-foreground">{item.item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Issues */}
        {issues.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Critical Issues</p>
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-2.5">
                  <Badge
                    variant={issue.priority === "HIGH" ? "destructive" : "outline"}
                    className="text-[9px] px-1.5 py-0 mb-1.5"
                  >
                    {issue.priority}
                  </Badge>
                  <p className="text-[10px] text-foreground/90 mb-1">{issue.issue}</p>
                  <p className="text-[10px] text-muted-foreground">{issue.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function SOPPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [evaluating, setEvaluating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [rightTab, setRightTab] = useState<"builder" | "eval">("builder")
  const [showRight, setShowRight] = useState(true)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: sops = [], isLoading } = useQuery<SOPIteration[]>({
    queryKey: ["sops"],
    queryFn: () => fetchJson<SOPIteration[]>("/api/sop"),
  })

  const { data: universities = [] } = useQuery<University[]>({
    queryKey: ["universities"],
    queryFn: () => fetchJson<University[]>("/api/universities"),
  })

  const selected = sops.find((s) => s.id === selectedId)

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      fetch("/api/sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sops"] })
      setSelectedId(data.id)
      setEditContent(data.content)
      setEditTitle(data.title)
      setCreating(false)
      toast({ title: "Draft created!" })
    },
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/sop/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent,
          title: editTitle,
          wordCount: editContent.split(/\s+/).filter(Boolean).length,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] })
      toast({ title: "Saved!" })
    },
  })

  const evaluate = async () => {
    if (!selectedId) return
    setEvaluating(true)
    try {
      const res = await fetch("/api/sop/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sopId: selectedId, content: editContent }),
      })
      const data = await res.json()
      queryClient.invalidateQueries({ queryKey: ["sops"] })
      setRightTab("eval")
      toast({ title: `Evaluation complete! Score: ${data.overallScore?.toFixed(1)}/10` })
    } catch {
      toast({ title: "Evaluation failed", variant: "destructive" })
    } finally {
      setEvaluating(false)
    }
  }

  const wordCount = editContent.split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col h-full">
      <Header
        title="SOP Lab"
        description="Write, build, and evaluate your Statement of Purpose"
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRight((v) => !v)}
              title={showRight ? "Hide panel" : "Show builder / evaluation panel"}
            >
              <PanelRight className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setCreating(true)
                setSelectedId(null)
                setEditContent("")
                setEditTitle(`Draft ${sops.length + 1}`)
              }}
            >
              <Plus className="w-4 h-4" /> New Draft
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Draft list ── */}
        <div className="w-56 border-r border-border flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <p className="text-xs text-muted-foreground font-medium">Drafts</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-0.5 p-2">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
                : sops.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedId(s.id)
                        setEditContent(s.content)
                        setEditTitle(s.title)
                        setCreating(false)
                      }}
                      className={cn(
                        "text-left p-2.5 rounded-lg transition-all duration-150",
                        selectedId === s.id ? "bg-primary/10 border border-primary/20" : "hover:bg-accent"
                      )}
                    >
                      <p className="text-xs font-medium truncate">{s.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{s.wordCount}w</span>
                        {s.overallScore && (
                          <span className={cn(
                            "text-[10px] font-bold",
                            s.overallScore >= 7 ? "text-emerald-400" : s.overallScore >= 5 ? "text-amber-400" : "text-red-400"
                          )}>
                            {s.overallScore.toFixed(1)}/10
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
            </div>
          </ScrollArea>
        </div>

        {/* ── Editor ── */}
        <div className="flex-1 flex flex-col p-4 gap-3 min-w-0 overflow-hidden">
          {creating || selectedId ? (
            <>
              <div className="flex items-center gap-3 shrink-0">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Draft title"
                  className="text-sm font-medium bg-transparent border-transparent hover:border-border focus:border-border h-8 px-2"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    "text-xs font-medium tabular-nums",
                    wordCount < 500 ? "text-amber-400" : wordCount > 1200 ? "text-red-400" : "text-emerald-400"
                  )}>
                    {wordCount} words
                  </span>
                  <Button size="sm" variant="outline" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || creating}>
                    {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                  </Button>
                  {creating && (
                    <Button
                      size="sm"
                      onClick={() => createMutation.mutate({ title: editTitle, content: editContent })}
                      disabled={!editTitle || createMutation.isPending}
                    >
                      {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Draft"}
                    </Button>
                  )}
                  {selectedId && (
                    <Button size="sm" onClick={evaluate} disabled={evaluating || wordCount < 50}>
                      {evaluating
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Evaluating…</>
                        : <><Sparkles className="w-3.5 h-3.5" /> Evaluate</>}
                    </Button>
                  )}
                </div>
              </div>

              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder={`Start writing your Statement of Purpose here…\n\nTip: Use the Builder panel → to get college-specific keywords, opening hooks, and theme alignment guidance for your target university.`}
                className="flex-1 resize-none text-sm leading-relaxed font-mono bg-card"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a draft or create a new one</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel: Builder + Evaluation ── */}
        {showRight && (
          <div className="w-80 border-l border-border bg-card flex flex-col shrink-0 overflow-hidden">
            {/* Tab bar */}
            <div className="flex shrink-0 border-b border-border px-3 h-10 items-end">
              {(["builder", "eval"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 pb-2 text-xs font-medium border-b-2 transition-all duration-150 mr-1",
                    rightTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "builder"
                    ? <><Wand2 className="w-3 h-3" /> Builder</>
                    : <>
                        <Sparkles className="w-3 h-3" /> Evaluation
                        {selected?.overallScore && (
                          <span className={cn(
                            "ml-1 text-[10px] font-bold",
                            selected.overallScore >= 7 ? "text-emerald-400"
                            : selected.overallScore >= 5 ? "text-amber-400"
                            : "text-red-400"
                          )}>
                            {selected.overallScore.toFixed(1)}
                          </span>
                        )}
                      </>
                  }
                </button>
              ))}
            </div>

            {/* Panel content — fills remaining height, scrolls internally */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {rightTab === "builder"
                ? <BuilderPanel universities={universities} editorContent={editContent} />
                : selected
                  ? <EvaluationPanel sop={selected} />
                  : (
                    <div className="h-full flex items-center justify-center p-6 text-center">
                      <div>
                        <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Select a draft and click Evaluate to see AI feedback.</p>
                      </div>
                    </div>
                  )
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
