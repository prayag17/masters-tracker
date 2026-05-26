import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUserId } from "@/lib/session"

export async function GET() {
  const result = await getAuthUserId()
  if ("error" in result) return result.error

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: result.userId },
  })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  return NextResponse.json(profile)
}

export async function POST(req: Request) {
  const result = await getAuthUserId()
  if ("error" in result) return result.error

  try {
    const body = await req.json()

    const data = {
      clerkUserId:        result.userId,
      email:              body.email ?? null,
      targetAdmissionYear: body.targetAdmissionYear,
      targetSemester:     body.targetSemester,
      targetYear:         Number(body.targetYear),
      targetDegreeField:  body.targetDegreeField,
      targetCountries:    Array.isArray(body.targetCountries)
                            ? body.targetCountries
                            : String(body.targetCountries).split(",").map((s: string) => s.trim()),
      undergraduateMajor: body.undergraduateMajor,
      undergraduateUniv:  body.undergraduateUniv ?? null,
      graduationYear:     body.graduationYear ? Number(body.graduationYear) : null,
      currentGPA:         Number(body.currentGPA),
      maxGPA:             Number(body.maxGPA ?? 4.0),
      testScores:         body.testScores ?? null,
      workExperience:     body.workExperience ?? null,
      totalWorkYears:     Number(body.totalWorkYears ?? 0),
      researchProjects:   body.researchProjects ?? null,
      publications:       body.publications ?? null,
      volunteerWork:      body.volunteerWork ?? null,
      awards:             body.awards ?? null,
      languages:          body.languages ?? null,
      fundingNeeded:      body.fundingNeeded ?? false,
      budgetUSD:          body.budgetUSD ? Number(body.budgetUSD) : null,
      scholarshipInterest: body.scholarshipInterest ?? false,
      cvFilePath:         body.cvFilePath ?? null,
      cvFileName:         body.cvFileName ?? null,
      linkedinUrl:        body.linkedinUrl || null,
      githubUrl:          body.githubUrl || null,
      portfolioUrl:       body.portfolioUrl || null,
      isOnboarded:        body.isOnboarded ?? false,
      onboardingStep:     body.onboardingStep ?? 0,
    }

    const profile = await prisma.userProfile.upsert({
      where:  { clerkUserId: result.userId },
      update: data,
      create: data,
    })

    return NextResponse.json(profile)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}
