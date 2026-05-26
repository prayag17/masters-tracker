export interface ScrapeRequest {
  universityName: string
  programName: string
  country: string
  websiteUrl?: string | null
}

export interface ScrapedData {
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
  rawText?: string
}
