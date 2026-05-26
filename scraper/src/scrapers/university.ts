import { chromium, type Page } from "playwright"
import type { ScrapeRequest, ScrapedData } from "../types.js"

// ─── Pattern extractors ────────────────────────────────────────────────────

function extractDate(text: string, patterns: RegExp[]): string | null {
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      try {
        const d = new Date(m[0].replace(/(\d+)(st|nd|rd|th)/, "$1"))
        if (!isNaN(d.getTime())) return d.toISOString()
      } catch {}
    }
  }
  return null
}

function extractNumber(text: string, patterns: RegExp[]): number | null {
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const n = parseFloat(m[1] ?? m[0])
      if (!isNaN(n)) return n
    }
  }
  return null
}

const DEADLINE_PATTERNS = [
  /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+20\d{2}/gi,
  /\d{1,2}\/\d{1,2}\/20\d{2}/g,
  /20\d{2}-\d{2}-\d{2}/g,
]

const GRE_QUANT_PATTERNS = [
  /GRE\s*(?:Quantitative)?[^\d]{0,30}(\d{3})/i,
  /Quant(?:itative)?[^\d]{0,20}(\d{3})/i,
]
const GRE_VERBAL_PATTERNS = [
  /GRE\s*Verbal[^\d]{0,30}(\d{3})/i,
  /Verbal[^\d]{0,20}(\d{3})/i,
]
const TOEFL_PATTERNS = [
  /TOEFL[^\d]{0,30}(\d{2,3})/i,
  /iBT[^\d]{0,20}(\d{2,3})/i,
]
const IELTS_PATTERNS = [
  /IELTS[^\d]{0,20}(\d\.\d)/i,
]
const FEE_PATTERNS = [
  /application\s+fee[^\d]{0,20}\$?(\d{2,3})/i,
  /\$(\d{2,3})\s+(?:application|fee)/i,
]
const TUITION_PATTERNS = [
  /tuition[^\d]{0,40}\$?([\d,]+)/i,
  /\$?([\d,]+)\s+(?:per\s+year|annually|per\s+semester)/i,
]

async function scrapeAdmissionPage(page: Page, url: string): Promise<Partial<ScrapedData>> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 })
  await page.waitForTimeout(2000)

  const text = await page.evaluate(() => document.body.innerText)

  const lines = text.split("\n")
  let regularDeadline: string | null = null
  let earlyActionDeadline: string | null = null

  // Look for deadline context
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (line.includes("deadline") || line.includes("due date")) {
      const context = lines.slice(Math.max(0, i - 1), i + 3).join(" ")
      if (line.includes("early") || line.includes("priority")) {
        earlyActionDeadline = extractDate(context, DEADLINE_PATTERNS)
      } else {
        regularDeadline = extractDate(context, DEADLINE_PATTERNS)
      }
    }
  }

  // If no contextual date found, extract first future date from page
  if (!regularDeadline) {
    regularDeadline = extractDate(text, DEADLINE_PATTERNS)
  }

  const tuitionRaw = extractNumber(text.replace(/,/g, ""), TUITION_PATTERNS)

  return {
    earlyActionDeadline,
    regularDeadline,
    avgGREQuantitative: extractNumber(text, GRE_QUANT_PATTERNS),
    avgGREVerbal: extractNumber(text, GRE_VERBAL_PATTERNS),
    avgTOEFL: extractNumber(text, TOEFL_PATTERNS),
    avgIELTS: extractNumber(text, IELTS_PATTERNS),
    applicationFee: extractNumber(text, FEE_PATTERNS),
    annualTuition: tuitionRaw && tuitionRaw > 1000 ? tuitionRaw : null,
    admissionPageUrl: url,
    rawText: text.slice(0, 3000),
  }
}

async function findAdmissionUrl(page: Page, universityName: string, programName: string): Promise<string | null> {
  const queries = [
    `${universityName} ${programName} application deadline`,
    `${universityName} graduate admissions requirements`,
  ]

  for (const q of queries) {
    try {
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(q)}`, {
        waitUntil: "domcontentloaded",
        timeout: 15_000,
      })
      await page.waitForTimeout(1500)

      // Extract first non-Google result that looks like a university admission page
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a[href]"))
        return anchors
          .map((a) => (a as HTMLAnchorElement).href)
          .filter(
            (href) =>
              href.startsWith("http") &&
              !href.includes("google.") &&
              !href.includes("youtube.") &&
              (href.includes("admiss") ||
                href.includes("apply") ||
                href.includes("graduate") ||
                href.includes("program"))
          )
          .slice(0, 3)
      })

      if (links.length > 0) return links[0]
    } catch {}
  }
  return null
}

export async function scrapeUniversity(req: ScrapeRequest): Promise<ScrapedData> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  })

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    })
    const page = await context.newPage()

    let targetUrl = req.websiteUrl ?? null

    // If no URL provided, search for it
    if (!targetUrl) {
      targetUrl = await findAdmissionUrl(page, req.universityName, req.programName)
    }

    if (!targetUrl) {
      return { rawText: "Could not find admission page URL" }
    }

    const scraped = await scrapeAdmissionPage(page, targetUrl)
    return scraped as ScrapedData
  } finally {
    await browser.close()
  }
}
