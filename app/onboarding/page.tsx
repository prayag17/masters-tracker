"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import {
  GraduationCap, ChevronRight, ChevronLeft, Check,
  Briefcase, DollarSign, Plus, Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingData {
  // Step 1 — Target
  targetDegreeField: string
  targetSemester:    string
  targetYear:        number
  targetCountries:   string

  // Step 2 — Academic
  undergraduateMajor: string
  undergraduateUniv:  string
  graduationYear:     number
  currentGPA:         number
  maxGPA:             number
  greStatus:   string
  greVerbal:   string
  greQuant:    string
  greAW:       string
  toeflStatus: string
  toeflScore:  string

  // Step 3 — Experience (Q&A, no entry forms)
  currentStatus:  string   // "student" | "graduated" | "working" | "research"
  totalWorkYears: string   // "0" | "<1" | "1-2" | "3-5" | "5+"
  workType:       string   // "industry" | "startup" | "research-lab" | "internships" | "mixed"
  researchStatus: string   // "published" | "unpublished" | "none"

  // Step 4 — Preferences
  fundingNeeded:       "yes" | "no" | "partial"
  budgetUSD:           string
  scholarshipInterest: boolean
  languages:           { language: string; proficiency: string }[]
  linkedinUrl:         string
  githubUrl:           string
}

const EMPTY: OnboardingData = {
  targetDegreeField: "",
  targetSemester: "Fall",
  targetYear: new Date().getFullYear() + 1,
  targetCountries: "USA, Canada",
  undergraduateMajor: "",
  undergraduateUniv: "",
  graduationYear: new Date().getFullYear(),
  currentGPA: 0,
  maxGPA: 4.0,
  greStatus: "planning",
  greVerbal: "", greQuant: "", greAW: "",
  toeflStatus: "planning",
  toeflScore: "",
  currentStatus: "",
  totalWorkYears: "",
  workType: "",
  researchStatus: "",
  fundingNeeded: "no",
  budgetUSD: "",
  scholarshipInterest: false,
  languages: [{ language: "English", proficiency: "fluent" }],
  linkedinUrl: "",
  githubUrl: "",
}

const STEPS = [
  { id: 1, label: "Goal",       icon: GraduationCap },
  { id: 2, label: "Academic",   icon: GraduationCap },
  { id: 3, label: "Background", icon: Briefcase     },
  { id: 4, label: "Finish",     icon: DollarSign    },
]

const STEP_META = [
  {
    title: "Where are you headed?",
    sub: "Choose your target program, intake year, and countries.",
  },
  {
    title: "Your academic profile",
    sub: "Undergraduate background, GPA, and test score status.",
  },
  {
    title: "What have you been up to?",
    sub: "A quick picture of your experience — no need to list every employer.",
  },
  {
    title: "Almost done",
    sub: "Funding preferences, languages, and optional links.",
  },
]

const DEGREE_FIELDS = [
  "MS in Computer Science", "MS in Data Science", "MS in Artificial Intelligence",
  "MS in Electrical Engineering", "MS in Mechanical Engineering", "MS in Robotics",
  "MS in Information Systems", "MS in Business Analytics", "MS in Financial Engineering",
  "MS in Cybersecurity", "MS in Biomedical Engineering", "MBA", "MEM", "Other",
]

// Maps the work-years chip value → a numeric totalWorkYears for the DB
const WORK_YEARS_MAP: Record<string, number> = {
  "0": 0, "<1": 0.5, "1-2": 1.5, "3-5": 4, "5+": 6,
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MCQChip({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        selected
          ? "bg-primary/12 border-primary/50 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]"
          : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground hover:bg-accent/50"
      )}>
      {children}
    </button>
  )
}

function FieldGroup({ label, sub, children }: {
  label: string; sub?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep]             = useState(1)
  const [data, setData]             = useState<OnboardingData>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const router  = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  const set = <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) =>
    setData((d) => ({ ...d, [key]: val }))

  function canAdvance(): boolean {
    if (step === 1) return !!data.targetDegreeField && !!data.targetSemester
    if (step === 2) return !!data.undergraduateMajor && data.currentGPA > 0
    return true
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const payload = {
        email:               user?.emailAddresses[0]?.emailAddress,
        targetSemester:      data.targetSemester,
        targetYear:          data.targetYear,
        targetAdmissionYear: `${data.targetSemester} ${data.targetYear}`,
        targetDegreeField:   data.targetDegreeField,
        targetCountries:     data.targetCountries.split(",").map((s) => s.trim()).filter(Boolean),
        undergraduateMajor:  data.undergraduateMajor,
        undergraduateUniv:   data.undergraduateUniv || null,
        graduationYear:      data.graduationYear,
        currentGPA:          data.currentGPA,
        maxGPA:              data.maxGPA,
        testScores: {
          gre: data.greStatus === "taken"
            ? { verbal: +data.greVerbal, quant: +data.greQuant, aw: +data.greAW, taken: true }
            : { taken: false, planned: data.greStatus === "planning" },
          toefl:        data.toeflStatus === "taken" ? +data.toeflScore : null,
          toeflPlanned: data.toeflStatus === "planning",
        },
        // Detailed entries deferred to Settings — send safe empty defaults
        workExperience:   [],
        totalWorkYears:   WORK_YEARS_MAP[data.totalWorkYears] ?? 0,
        researchProjects: [],
        publications:     [],
        volunteerWork:    [],
        awards:           [],
        languages:        data.languages,
        fundingNeeded:    data.fundingNeeded !== "no",
        fundingType:      data.fundingNeeded,
        budgetUSD:        data.budgetUSD ? +data.budgetUSD : null,
        scholarshipInterest: data.scholarshipInterest,
        linkedinUrl:      data.linkedinUrl || null,
        githubUrl:        data.githubUrl || null,
        portfolioUrl:     null,
        isOnboarded:      true,
        onboardingStep:   4,
      }

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save profile")

      toast({ title: "Profile complete!", description: "Taking you to your workspace…" })
      router.push("/")
    } catch {
      toast({ title: "Error saving profile", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const stepMeta   = STEP_META[step - 1]
  const progressPct = Math.round(((step - 1) / (STEPS.length - 1)) * 100)
  const currentYear = new Date().getFullYear()
  const showWorkType = data.totalWorkYears && data.totalWorkYears !== "0"

  return (
    <div className="min-h-screen bg-dots flex flex-col">

      {/* ── Top nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 h-14
        border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="hsl(var(--primary))" />
            <path d="M6 20V9L14 16.5L22 9V20"
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-semibold">MastersTrack</span>
        </div>

        {/* Step pills */}
        <div className="hidden sm:flex items-center gap-1.5">
          {STEPS.map((s) => {
            const done   = step > s.id
            const active = step === s.id
            return (
              <div key={s.id} className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border transition-all",
                done   ? "bg-primary border-primary text-primary-foreground"
                : active ? "border-primary text-primary bg-primary/10"
                         : "border-border/50 text-muted-foreground/50"
              )}>
                {done ? <Check className="w-2.5 h-2.5" /> : s.id}
              </div>
            )
          })}
        </div>

        <span className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</span>
      </header>

      {/* ── Progress bar ─────────────────────────────────────────────────────── */}
      <div className="h-0.5 bg-border/30">
        <div className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }} />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center p-4 pt-8 pb-16">
        <div className="w-full max-w-2xl space-y-5">

          {/* Step header */}
          <div className="px-1">
            <h1 className="text-xl font-bold">{stepMeta.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{stepMeta.sub}</p>
          </div>

          <div className="bento-card p-6 space-y-7">

            {/* ── Step 1: Target ─────────────────────────────────────────────── */}
            {step === 1 && (
              <>
                <FieldGroup label="Degree you're pursuing">
                  <div className="flex gap-2 flex-wrap">
                    {DEGREE_FIELDS.map((d) => (
                      <MCQChip key={d} selected={data.targetDegreeField === d}
                        onClick={() => set("targetDegreeField", d)}>
                        {d}
                      </MCQChip>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Target intake">
                  <div className="flex gap-2 flex-wrap">
                    {["Fall", "Spring"].map((sem) => (
                      <MCQChip key={sem} selected={data.targetSemester === sem}
                        onClick={() => set("targetSemester", sem)}>
                        {sem}
                      </MCQChip>
                    ))}
                    {Array.from({ length: 5 }, (_, i) => currentYear + i).map((y) => (
                      <MCQChip key={y} selected={data.targetYear === y}
                        onClick={() => set("targetYear", y)}>
                        {y}
                      </MCQChip>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Target countries" sub="Comma-separated">
                  <Input
                    placeholder="USA, Canada, UK, Germany"
                    value={data.targetCountries}
                    onChange={(e) => set("targetCountries", e.target.value)}
                    className="max-w-sm"
                  />
                </FieldGroup>
              </>
            )}

            {/* ── Step 2: Academic ───────────────────────────────────────────── */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Undergraduate major">
                    <Input placeholder="e.g. Computer Science"
                      value={data.undergraduateMajor}
                      onChange={(e) => set("undergraduateMajor", e.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="University">
                    <Input placeholder="e.g. IIT Delhi"
                      value={data.undergraduateUniv}
                      onChange={(e) => set("undergraduateUniv", e.target.value)} />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FieldGroup label="Graduation year">
                    <Select value={String(data.graduationYear)}
                      onValueChange={(v) => set("graduationYear", +v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => currentYear - 8 + i).map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup label="GPA">
                    <Input type="number" step="0.01" placeholder="3.7"
                      value={data.currentGPA || ""}
                      onChange={(e) => set("currentGPA", +e.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="Out of">
                    <Select value={String(data.maxGPA)}
                      onValueChange={(v) => set("maxGPA", +v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[4.0, 5.0, 10.0].map((m) => (
                          <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                </div>

                <FieldGroup label="GRE status">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      ["taken",    "Already taken"],
                      ["planning", "Planning to take"],
                      ["skipping", "Not required"],
                    ].map(([v, l]) => (
                      <MCQChip key={v} selected={data.greStatus === v}
                        onClick={() => set("greStatus", v)}>
                        {l}
                      </MCQChip>
                    ))}
                  </div>
                  {data.greStatus === "taken" && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {([["greVerbal","Verbal (130–170)"],["greQuant","Quant (130–170)"],["greAW","AW (0–6)"]] as [keyof OnboardingData, string][]).map(([k, lbl]) => (
                        <div key={k as string}>
                          <Label className="text-xs mb-1 block">{lbl}</Label>
                          <Input type="number"
                            placeholder={k === "greAW" ? "4.5" : "160"}
                            value={data[k] as string}
                            onChange={(e) => set(k, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  )}
                </FieldGroup>

                <FieldGroup label="English proficiency test">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      ["taken",    "TOEFL / IELTS taken"],
                      ["planning", "Planning to take"],
                      ["exempt",   "Native / exempt"],
                    ].map(([v, l]) => (
                      <MCQChip key={v} selected={data.toeflStatus === v}
                        onClick={() => set("toeflStatus", v)}>
                        {l}
                      </MCQChip>
                    ))}
                  </div>
                  {data.toeflStatus === "taken" && (
                    <div className="mt-3 max-w-[160px]">
                      <Label className="text-xs mb-1 block">Score</Label>
                      <Input type="number" placeholder="110"
                        value={data.toeflScore}
                        onChange={(e) => set("toeflScore", e.target.value)} />
                    </div>
                  )}
                </FieldGroup>
              </>
            )}

            {/* ── Step 3: Background (Q&A) ────────────────────────────────────── */}
            {step === 3 && (
              <>
                <FieldGroup label="What best describes you right now?">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      ["student",   "Currently studying"],
                      ["graduated", "Recently graduated"],
                      ["working",   "Working in industry"],
                      ["research",  "In a research role"],
                    ].map(([v, l]) => (
                      <MCQChip key={v} selected={data.currentStatus === v}
                        onClick={() => set("currentStatus", v)}>
                        {l}
                      </MCQChip>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Years of professional experience"
                  sub="Include internships, full-time, and part-time roles">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      ["0",   "None"],
                      ["<1",  "< 1 year"],
                      ["1-2", "1–2 years"],
                      ["3-5", "3–5 years"],
                      ["5+",  "5+ years"],
                    ].map(([v, l]) => (
                      <MCQChip key={v} selected={data.totalWorkYears === v}
                        onClick={() => set("totalWorkYears", v)}>
                        {l}
                      </MCQChip>
                    ))}
                  </div>
                </FieldGroup>

                {showWorkType && (
                  <FieldGroup label="What type of work?">
                    <div className="flex gap-2 flex-wrap">
                      {[
                        ["industry",     "Industry / Corporate"],
                        ["startup",      "Startup"],
                        ["research-lab", "Research lab"],
                        ["internships",  "Internships only"],
                        ["mixed",        "Mixed"],
                      ].map(([v, l]) => (
                        <MCQChip key={v} selected={data.workType === v}
                          onClick={() => set("workType", v)}>
                          {l}
                        </MCQChip>
                      ))}
                    </div>
                  </FieldGroup>
                )}

                <FieldGroup label="Research or academic projects?">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      ["published",   "Yes — published or presented"],
                      ["unpublished", "Yes — unpublished"],
                      ["none",        "No research yet"],
                    ].map(([v, l]) => (
                      <MCQChip key={v} selected={data.researchStatus === v}
                        onClick={() => set("researchStatus", v)}>
                        {l}
                      </MCQChip>
                    ))}
                  </div>
                </FieldGroup>

                <p className="text-xs text-muted-foreground/60">
                  You can add specific employers, publications, and extracurriculars from Settings after setup.
                </p>
              </>
            )}

            {/* ── Step 4: Preferences ────────────────────────────────────────── */}
            {step === 4 && (
              <>
                <FieldGroup label="Will you need financial aid or scholarships?">
                  <div className="flex gap-2 flex-wrap">
                    {([
                      ["yes",     "Yes — I need funding"],
                      ["partial", "Partial is fine"],
                      ["no",      "Self-funded"],
                    ] as [string, string][]).map(([v, l]) => (
                      <MCQChip key={v} selected={data.fundingNeeded === v}
                        onClick={() => set("fundingNeeded", v as "yes" | "no" | "partial")}>
                        {l}
                      </MCQChip>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Annual budget" sub="USD, tuition + living — helps filter programs to your range">
                  <div className="flex gap-2 flex-wrap">
                    {["20000","30000","40000","50000","60000","80000","100000+"].map((b) => (
                      <MCQChip key={b} selected={data.budgetUSD === b}
                        onClick={() => set("budgetUSD", b)}>
                        ${b.replace("+", "")}{b.endsWith("+") ? "+" : ""}
                      </MCQChip>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Interested in merit scholarships?">
                  <div className="flex gap-2">
                    {[["yes", "Yes"], ["no", "Not a priority"]].map(([v, l]) => (
                      <MCQChip key={v} selected={data.scholarshipInterest === (v === "yes")}
                        onClick={() => set("scholarshipInterest", v === "yes")}>
                        {l}
                      </MCQChip>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Languages you speak">
                  <div className="space-y-2">
                    {data.languages.map((lang, i) => (
                      <div key={i} className="flex gap-2 items-center flex-wrap">
                        <Input
                          placeholder="Language"
                          value={lang.language}
                          className="w-36 shrink-0"
                          onChange={(e) => set("languages",
                            data.languages.map((x, j) => j === i ? { ...x, language: e.target.value } : x)
                          )}
                        />
                        <div className="flex gap-1 flex-wrap">
                          {["native", "fluent", "intermediate", "basic"].map((p) => (
                            <MCQChip key={p}
                              selected={lang.proficiency === p}
                              onClick={() => set("languages",
                                data.languages.map((x, j) => j === i ? { ...x, proficiency: p } : x)
                              )}>
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </MCQChip>
                          ))}
                        </div>
                        {data.languages.length > 1 && (
                          <button type="button"
                            onClick={() => set("languages", data.languages.filter((_, j) => j !== i))}
                            className="text-muted-foreground/40 hover:text-destructive transition-colors ml-auto">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => set("languages", [...data.languages, { language: "", proficiency: "fluent" }])}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add language
                    </Button>
                  </div>
                </FieldGroup>

                <FieldGroup label="Profile links" sub="Optional — helps us give better context">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">LinkedIn</Label>
                      <Input placeholder="linkedin.com/in/yourname"
                        value={data.linkedinUrl}
                        onChange={(e) => set("linkedinUrl", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">GitHub</Label>
                      <Input placeholder="github.com/yourname"
                        value={data.githubUrl}
                        onChange={(e) => set("githubUrl", e.target.value)} />
                    </div>
                  </div>
                </FieldGroup>
              </>
            )}

            {/* ── Navigation ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 pt-3 mt-1 border-t border-border/40">
              {step > 1 ? (
                <Button type="button" variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  className="gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </Button>
              ) : <div />}
              <div className="flex-1" />
              {step < STEPS.length ? (
                <Button type="button"
                  disabled={!canAdvance()}
                  onClick={() => canAdvance() && setStep((s) => s + 1)}
                  className="gap-1.5 min-w-[120px]">
                  Continue <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="gap-1.5 min-w-[160px]">
                  {submitting
                    ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                    : <><Check className="w-3.5 h-3.5" /> Launch workspace</>
                  }
                </Button>
              )}
            </div>
          </div>

          {/* Profile summary card — visible on final step */}
          {step === 4 && (
            <div className="bento-card p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Your profile at a glance
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                {[
                  ["Program",    data.targetDegreeField || "—"],
                  ["Intake",     `${data.targetSemester} ${data.targetYear}`],
                  ["Countries",  data.targetCountries || "—"],
                  ["Major",      data.undergraduateMajor || "—"],
                  ["GPA",        data.currentGPA ? `${data.currentGPA} / ${data.maxGPA}` : "—"],
                  ["Experience", data.totalWorkYears
                    ? data.totalWorkYears === "0" ? "None" : `${data.totalWorkYears} yr${data.totalWorkYears === "<1" ? "" : "s"}`
                    : "—"],
                  ["Research",   !data.researchStatus || data.researchStatus === "none"
                    ? "None"
                    : data.researchStatus === "published" ? "Published / presented" : "Unpublished"],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
