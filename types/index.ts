export type ApplicationStatus =
  | "researching"
  | "applied"
  | "interview"
  | "accepted"
  | "rejected"
  | "waitlisted"

export type Priority = "high" | "medium" | "low"

export type Urgency = "low" | "medium" | "high" | "critical"

export type TaskCategory =
  | "test-prep"
  | "research"
  | "sop"
  | "application"
  | "networking"
  | "financial"

export type TaskPhase =
  | "pre-application"
  | "shortlisting"
  | "applications"
  | "visa-finance"

export type ContactType = "alumni" | "professor" | "student" | "staff"

export type ContactStatus =
  | "not-contacted"
  | "contacted"
  | "replied"
  | "meeting-scheduled"
  | "follow-up-needed"

export type ExpenseCategory =
  | "application-fee"
  | "test-prep"
  | "visa"
  | "tuition"
  | "living"
  | "travel"
  | "misc"

export interface UserProfile {
  id: string
  targetAdmissionYear: string
  targetSemester: string
  targetYear: number
  undergraduateMajor: string
  targetDegreeField: string
  currentGPA: number
  maxGPA: number
  targetCountries: string[]
  isOnboarded: boolean
  createdAt: string
  updatedAt: string
}

export interface University {
  id: string
  name: string
  country: string
  city?: string | null
  programName: string
  department?: string | null
  applicationStatus: ApplicationStatus
  priority: Priority
  notes?: string | null
  websiteUrl?: string | null
  earlyActionDeadline?: string | null
  regularDeadline?: string | null
  rollingDeadline?: string | null
  applicationFee?: number | null
  avgGREVerbal?: number | null
  avgGREQuantitative?: number | null
  avgGREAW?: number | null
  avgTOEFL?: number | null
  avgIELTS?: number | null
  annualTuition?: number | null
  admissionPageUrl?: string | null
  lastScraped?: string | null
  scrapingStatus: string
  profileId: string
  createdAt: string
  updatedAt: string
}

export interface DailyTask {
  id: string
  title: string
  description?: string | null
  phase: TaskPhase
  dueDate: string
  completed: boolean
  completedAt?: string | null
  urgency: Urgency
  category: TaskCategory
  isGenerated: boolean
  profileId: string
  createdAt: string
  updatedAt: string
}

export type TaskPreview = {
	title: string;
	dueDate: string | Date;
	urgency: Urgency;
};

export interface SOPIteration {
  id: string
  version: number
  title: string
  content: string
  wordCount: number
  targetUniversity?: string | null
  overallScore?: number | null
  evaluationStatus: string
  criticFeedback?: unknown
  officerFeedback?: unknown
  validatorOutput?: unknown
  evaluatedAt?: string | null
  universityId?: string | null
  profileId: string
  createdAt: string
  updatedAt: string
}

export interface NetworkingContact {
  id: string
  name: string
  title: string
  university: string
  department?: string | null
  linkedinUrl?: string | null
  email?: string | null
  type: ContactType
  status: ContactStatus
  outreachDate?: string | null
  lastFollowUp?: string | null
  nextFollowUp?: string | null
  notes?: string | null
  templateUsed?: string | null
  profileId: string
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  currency: string
  date: string
  isPaid: boolean
  notes?: string | null
  universityId?: string | null
  university?: { name: string } | null
  profileId: string
  createdAt: string
  updatedAt: string
}
