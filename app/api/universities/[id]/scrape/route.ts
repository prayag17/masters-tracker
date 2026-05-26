import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const SCRAPER_URL = process.env.SCRAPER_SERVICE_URL ?? "http://localhost:3001"

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const university = await prisma.university.findUnique({ where: { id } })
  if (!university) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Mark as running
  await prisma.university.update({ where: { id }, data: { scrapingStatus: "running" } })

  try {
    const res = await fetch(`${SCRAPER_URL}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        universityName: university.name,
        programName: university.programName,
        country: university.country,
        websiteUrl: university.websiteUrl,
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) throw new Error(`Scraper responded with ${res.status}`)

    const scraped = await res.json()

    const updated = await prisma.university.update({
      where: { id },
      data: {
        earlyActionDeadline: scraped.earlyActionDeadline ? new Date(scraped.earlyActionDeadline) : undefined,
        regularDeadline: scraped.regularDeadline ? new Date(scraped.regularDeadline) : undefined,
        rollingDeadline: scraped.rollingDeadline ? new Date(scraped.rollingDeadline) : undefined,
        applicationFee: scraped.applicationFee ?? undefined,
        avgGREVerbal: scraped.avgGREVerbal ?? undefined,
        avgGREQuantitative: scraped.avgGREQuantitative ?? undefined,
        avgGREAW: scraped.avgGREAW ?? undefined,
        avgTOEFL: scraped.avgTOEFL ?? undefined,
        avgIELTS: scraped.avgIELTS ?? undefined,
        annualTuition: scraped.annualTuition ?? undefined,
        admissionPageUrl: scraped.admissionPageUrl ?? undefined,
        lastScraped: new Date(),
        scrapingStatus: "done",
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    await prisma.university.update({ where: { id }, data: { scrapingStatus: "failed" } })
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
