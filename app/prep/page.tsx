"use client"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, Loader2, CheckCircle2, XCircle, Flame, RefreshCw, Brain, Calculator } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { PrepQuestion } from "@/lib/llm"

const TODAY = format(new Date(), "yyyy-MM-dd")
const STREAK_KEY = "prep_streak"
const LAST_PRACTICED_KEY = "prep_last_practiced"

type TabType = "verbal" | "quant" | "ielts"

function useStreak() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const last = localStorage.getItem(LAST_PRACTICED_KEY)
    const stored = parseInt(localStorage.getItem(STREAK_KEY) ?? "0", 10)
    if (!last) { setStreak(0); return }
    const yesterday = format(new Date(Date.now() - 864e5), "yyyy-MM-dd")
    if (last === TODAY) setStreak(stored)
    else if (last === yesterday) setStreak(stored) // still valid, will update when practiced
    else { localStorage.setItem(STREAK_KEY, "0"); setStreak(0) }
  }, [])

  const markPracticed = () => {
    const last = localStorage.getItem(LAST_PRACTICED_KEY)
    if (last === TODAY) return // already counted today
    const yesterday = format(new Date(Date.now() - 864e5), "yyyy-MM-dd")
    const prev = parseInt(localStorage.getItem(STREAK_KEY) ?? "0", 10)
    const next = last === yesterday ? prev + 1 : 1
    localStorage.setItem(STREAK_KEY, String(next))
    localStorage.setItem(LAST_PRACTICED_KEY, TODAY)
    setStreak(next)
  }

  return { streak, markPracticed }
}

function QuestionPanel({ type }: { type: TabType }) {
  const [questionKey, setQuestionKey] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const { markPracticed } = useStreak()

  const { data: q, isLoading, isError, refetch } = useQuery<PrepQuestion>({
    queryKey: ["prep", type, TODAY, questionKey],
    queryFn: () =>
      fetch(`/api/prep/daily?type=${type}&date=${TODAY}-${questionKey}`).then((r) => {
        if (!r.ok) throw new Error(`API error ${r.status}`)
        return r.json()
      }),
    staleTime: Infinity,
    retry: 1,
  })

  const handleSelect = (opt: string) => {
    if (revealed) return
    setSelected(opt)
  }

  const handleReveal = () => {
    setRevealed(true)
    markPracticed()
  }

  const handleNext = () => {
    setQuestionKey((k) => k + 1)
    setSelected(null)
    setRevealed(false)
  }

  const letter = (opt: string) => opt.charAt(0)

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <XCircle className="w-8 h-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">Failed to load question. Check your OPENROUTER_API_KEY.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </Button>
      </div>
    )
  }

  if (isLoading || !q) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-6 w-24 rounded" />
        <Skeleton className="h-20 w-full rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
      </div>
    )
  }

  // Guard against malformed LLM responses (e.g. missing options field)
  if (!Array.isArray(q.options) || !q.question || !q.answer) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <XCircle className="w-8 h-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">Question format was invalid. The AI response may have been truncated.</p>
        <Button size="sm" variant="outline" onClick={handleNext}>
          <RefreshCw className="w-3.5 h-3.5" /> Try another
        </Button>
      </div>
    )
  }

  const isCorrect = selected && letter(selected) === q.answer

  return (
    <div className="space-y-4 mt-4 max-w-2xl">
      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-[10px]">{q.questionType}</Badge>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px]",
            q.difficulty === "Hard" ? "text-red-400 border-red-400/30" :
            q.difficulty === "Medium" ? "text-amber-400 border-amber-400/30" :
            "text-emerald-400 border-emerald-400/30"
          )}
        >
          {q.difficulty}
        </Badge>
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt) => {
          const l = letter(opt)
          const isSelected = selected === opt
          const isAnswerOpt = revealed && l === q.answer
          const isWrong = revealed && isSelected && !isCorrect

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={revealed}
              className={cn(
                "w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-150",
                "disabled:cursor-default",
                isAnswerOpt
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : isWrong
                  ? "bg-red-500/10 border-red-500/40 text-red-400"
                  : isSelected
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-card border-border hover:bg-accent hover:border-border text-foreground"
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold mr-3",
                isAnswerOpt ? "bg-emerald-500/20" : isWrong ? "bg-red-500/20" : isSelected ? "bg-primary/20" : "bg-muted"
              )}>
                {l}
              </span>
              {opt.slice(3)}
            </button>
          )
        })}
      </div>

      {/* Result */}
      {selected && !revealed && (
        <Button onClick={handleReveal} className="w-full">
          Reveal Answer
        </Button>
      )}

      {revealed && (
        <div className={cn(
          "rounded-xl border p-4 space-y-2",
          isCorrect ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
        )}>
          <div className="flex items-center gap-2">
            {isCorrect
              ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              : <XCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            <p className="text-sm font-medium">
              {isCorrect ? "Correct!" : `Correct answer: ${q.answer}`}
            </p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
          <Button size="sm" variant="outline" onClick={handleNext} className="mt-2">
            <RefreshCw className="w-3.5 h-3.5" /> Next Question
          </Button>
        </div>
      )}
    </div>
  )
}

export default function PrepPage() {
  const [tab, setTab] = useState<TabType>("verbal")
  const { streak } = useStreak()
  // Read localStorage only after mount to avoid SSR/client hydration mismatch
  const [practicedToday, setPracticedToday] = useState(false)
  useEffect(() => {
    setPracticedToday(localStorage.getItem(LAST_PRACTICED_KEY) === TODAY)
  }, [])

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Test Prep Corner"
        description="Daily GRE &amp; IELTS practice questions"
        actions={
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm",
              practicedToday
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-muted border-border text-muted-foreground"
            )}>
              <Flame className="w-3.5 h-3.5" />
              <span className="font-semibold">{streak}</span>
              <span className="text-xs">{streak === 1 ? "day" : "days"}</span>
            </div>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-7 animate-fade-in">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabType)}>
          <TabsList>
            <TabsTrigger value="verbal" className="gap-1.5">
              <Brain className="w-3.5 h-3.5" /> GRE Verbal
            </TabsTrigger>
            <TabsTrigger value="quant" className="gap-1.5">
              <Calculator className="w-3.5 h-3.5" /> GRE Quant
            </TabsTrigger>
            <TabsTrigger value="ielts" className="gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> IELTS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verbal"><QuestionPanel type="verbal" /></TabsContent>
          <TabsContent value="quant"><QuestionPanel type="quant" /></TabsContent>
          <TabsContent value="ielts"><QuestionPanel type="ielts" /></TabsContent>
        </Tabs>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8 pt-6 border-t border-border">
          {[
            { icon: Brain, title: "GRE Verbal", desc: "Text completion, sentence equivalence, and reading comprehension questions aligned to ETS format." },
            { icon: Calculator, title: "GRE Quant", desc: "Problem solving and quantitative comparison covering arithmetic, algebra, geometry, and data analysis." },
            { icon: BookOpen, title: "IELTS", desc: "Vocabulary in context, grammar, and Task 2 writing prompts with model answer explanations." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bento-card flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
