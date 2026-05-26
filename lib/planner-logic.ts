import { addDays, format, isWithinInterval, differenceInDays } from "date-fns"

export type Phase = {
  id: string
  label: string
  startDate: Date
  endDate: Date
  color: string
}

export type TaskTemplate = {
  title: string
  description: string
  category: string
  phase: string
  offsetFromPhaseStart: number // days from phase start
  urgencyAtStart: "low" | "medium" | "high" | "critical"
}

export function computePhases(targetSemester: string, targetYear: number): Phase[] {
  const appYear = targetSemester === "Fall" ? targetYear - 1 : targetYear

  if (targetSemester === "Fall") {
    return [
      {
        id: "pre-application",
        label: "Pre-Application & Test Prep",
        startDate: new Date(`${appYear}-05-01`),
        endDate: new Date(`${appYear}-08-31`),
        color: "text-blue-400",
      },
      {
        id: "shortlisting",
        label: "Shortlisting & Outreach",
        startDate: new Date(`${appYear}-08-01`),
        endDate: new Date(`${appYear}-10-31`),
        color: "text-violet-400",
      },
      {
        id: "applications",
        label: "Applications & SOP Drafting",
        startDate: new Date(`${appYear}-10-01`),
        endDate: new Date(`${appYear}-12-31`),
        color: "text-amber-400",
      },
      {
        id: "visa-finance",
        label: "Visa & Finance Tracking",
        startDate: new Date(`${targetYear}-01-01`),
        endDate: new Date(`${targetYear}-05-31`),
        color: "text-emerald-400",
      },
    ]
  }

  // Spring semester (one cycle earlier)
  return [
    {
      id: "pre-application",
      label: "Pre-Application & Test Prep",
      startDate: new Date(`${appYear - 1}-11-01`),
      endDate: new Date(`${appYear}-03-31`),
      color: "text-blue-400",
    },
    {
      id: "shortlisting",
      label: "Shortlisting & Outreach",
      startDate: new Date(`${appYear}-03-01`),
      endDate: new Date(`${appYear}-05-31`),
      color: "text-violet-400",
    },
    {
      id: "applications",
      label: "Applications & SOP Drafting",
      startDate: new Date(`${appYear}-05-01`),
      endDate: new Date(`${appYear}-07-31`),
      color: "text-amber-400",
    },
    {
      id: "visa-finance",
      label: "Visa & Finance Tracking",
      startDate: new Date(`${appYear}-08-01`),
      endDate: new Date(`${targetYear}-01-31`),
      color: "text-emerald-400",
    },
  ]
}

export function getCurrentPhase(phases: Phase[]): Phase | null {
  const now = new Date()
  return phases.find((p) => isWithinInterval(now, { start: p.startDate, end: p.endDate })) ?? null
}

export function computeUrgency(
  dueDate: Date,
  baseUrgency: "low" | "medium" | "high" | "critical"
): "low" | "medium" | "high" | "critical" {
  const days = differenceInDays(dueDate, new Date())
  if (days <= 3) return "critical"
  if (days <= 7) return "high"
  if (days <= 14) return "medium"
  return baseUrgency
}

const TASK_TEMPLATES: TaskTemplate[] = [
  // Pre-application phase
  { title: "Register for GRE", description: "Book your GRE exam slot at ets.org", category: "test-prep", phase: "pre-application", offsetFromPhaseStart: 0, urgencyAtStart: "high" },
  { title: "GRE Verbal Practice (Week 1)", description: "Complete 2 GRE verbal sections", category: "test-prep", phase: "pre-application", offsetFromPhaseStart: 7, urgencyAtStart: "medium" },
  { title: "GRE Quant Practice (Week 1)", description: "Complete 2 GRE quant sections", category: "test-prep", phase: "pre-application", offsetFromPhaseStart: 9, urgencyAtStart: "medium" },
  { title: "Register for TOEFL/IELTS", description: "Book English proficiency test", category: "test-prep", phase: "pre-application", offsetFromPhaseStart: 14, urgencyAtStart: "high" },
  { title: "GRE Mock Exam 1", description: "Full practice GRE under exam conditions", category: "test-prep", phase: "pre-application", offsetFromPhaseStart: 30, urgencyAtStart: "high" },
  { title: "Request transcripts", description: "Order official transcripts from your university", category: "application", phase: "pre-application", offsetFromPhaseStart: 45, urgencyAtStart: "high" },
  { title: "Contact 3 potential recommenders", description: "Reach out to professors/supervisors for LORs", category: "networking", phase: "pre-application", offsetFromPhaseStart: 50, urgencyAtStart: "high" },
  { title: "TOEFL/IELTS exam day", description: "Take English proficiency test", category: "test-prep", phase: "pre-application", offsetFromPhaseStart: 60, urgencyAtStart: "critical" },
  { title: "GRE exam day", description: "Take the official GRE exam", category: "test-prep", phase: "pre-application", offsetFromPhaseStart: 75, urgencyAtStart: "critical" },

  // Shortlisting phase
  { title: "Finalize university shortlist", description: "Research and narrow to 8-12 programs", category: "research", phase: "shortlisting", offsetFromPhaseStart: 0, urgencyAtStart: "high" },
  { title: "Email Professor A for research alignment", description: "Reach out to a faculty member whose research matches your interests", category: "networking", phase: "shortlisting", offsetFromPhaseStart: 5, urgencyAtStart: "medium" },
  { title: "Email Professor B for research alignment", description: "Reach out to another faculty member", category: "networking", phase: "shortlisting", offsetFromPhaseStart: 7, urgencyAtStart: "medium" },
  { title: "Connect with 5 alumni on LinkedIn", description: "Message program alumni for insights", category: "networking", phase: "shortlisting", offsetFromPhaseStart: 10, urgencyAtStart: "medium" },
  { title: "Compile program deadlines spreadsheet", description: "List all deadlines, fees, and requirements per program", category: "research", phase: "shortlisting", offsetFromPhaseStart: 14, urgencyAtStart: "high" },
  { title: "Draft initial SOP outline", description: "Create a master outline for your SOP", category: "sop", phase: "shortlisting", offsetFromPhaseStart: 21, urgencyAtStart: "high" },
  { title: "LOR follow-up with recommenders", description: "Send a polite reminder to recommenders", category: "application", phase: "shortlisting", offsetFromPhaseStart: 30, urgencyAtStart: "high" },
  { title: "Create application fee budget", description: "Estimate total application costs", category: "financial", phase: "shortlisting", offsetFromPhaseStart: 45, urgencyAtStart: "medium" },

  // Applications phase
  { title: "Complete SOP draft v1", description: "Write the first complete draft of your SOP", category: "sop", phase: "applications", offsetFromPhaseStart: 7, urgencyAtStart: "critical" },
  { title: "SOP peer review", description: "Share SOP with a mentor or peer for feedback", category: "sop", phase: "applications", offsetFromPhaseStart: 14, urgencyAtStart: "high" },
  { title: "Submit application — University 1", description: "Submit the first application in your list", category: "application", phase: "applications", offsetFromPhaseStart: 21, urgencyAtStart: "critical" },
  { title: "Submit application — University 2", description: "Submit the second application", category: "application", phase: "applications", offsetFromPhaseStart: 28, urgencyAtStart: "critical" },
  { title: "SOP v2 — tailored revisions", description: "Tailor SOP for remaining programs", category: "sop", phase: "applications", offsetFromPhaseStart: 30, urgencyAtStart: "high" },
  { title: "Submit remaining applications", description: "Submit all outstanding applications", category: "application", phase: "applications", offsetFromPhaseStart: 60, urgencyAtStart: "critical" },
  { title: "Confirm LOR submissions", description: "Verify all recommenders have submitted LORs", category: "application", phase: "applications", offsetFromPhaseStart: 65, urgencyAtStart: "critical" },

  // Visa & Finance phase
  { title: "Research F-1/study visa requirements", description: "Review visa requirements for your target countries", category: "financial", phase: "visa-finance", offsetFromPhaseStart: 0, urgencyAtStart: "medium" },
  { title: "Track application decisions", description: "Monitor portals for admission decisions", category: "research", phase: "visa-finance", offsetFromPhaseStart: 7, urgencyAtStart: "high" },
  { title: "Evaluate financial aid offers", description: "Compare funding packages from admitted programs", category: "financial", phase: "visa-finance", offsetFromPhaseStart: 30, urgencyAtStart: "high" },
  { title: "Confirm enrollment decision", description: "Send enrollment confirmation to chosen program", category: "application", phase: "visa-finance", offsetFromPhaseStart: 60, urgencyAtStart: "critical" },
  { title: "Apply for student visa", description: "Submit visa application with I-20 / offer letter", category: "financial", phase: "visa-finance", offsetFromPhaseStart: 75, urgencyAtStart: "critical" },
  { title: "Arrange accommodation", description: "Research and secure housing near campus", category: "financial", phase: "visa-finance", offsetFromPhaseStart: 90, urgencyAtStart: "high" },
]

export function generateTasks(
  phases: Phase[],
  profileId: string
): Array<{
  title: string
  description: string
  category: string
  phase: string
  dueDate: Date
  urgency: "low" | "medium" | "high" | "critical"
  isGenerated: boolean
  profileId: string
}> {
  const phaseMap = Object.fromEntries(phases.map((p) => [p.id, p]))

  return TASK_TEMPLATES.map((t) => {
    const phase = phaseMap[t.phase]
    if (!phase) return null
    const dueDate = addDays(phase.startDate, t.offsetFromPhaseStart)
    return {
      title: t.title,
      description: t.description,
      category: t.category,
      phase: t.phase,
      dueDate,
      urgency: computeUrgency(dueDate, t.urgencyAtStart),
      isGenerated: true,
      profileId,
    }
  }).filter(Boolean) as ReturnType<typeof generateTasks>
}
