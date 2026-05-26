/**
 * Seed file — creates a demo profile for local development.
 * Run with: pnpm db:seed
 *
 * Note: in production, profiles are created via the onboarding flow
 * after Clerk authentication. The clerkUserId here is a placeholder.
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const DEV_CLERK_USER_ID = "dev_seed_user_placeholder"

async function main() {
  const existing = await prisma.userProfile.findUnique({
    where: { clerkUserId: DEV_CLERK_USER_ID },
  })

  if (existing) {
    console.log("Seed profile already exists, skipping.")
    return
  }

  const profile = await prisma.userProfile.create({
    data: {
      clerkUserId:         DEV_CLERK_USER_ID,
      email:               "dev@masterstrack.local",
      targetAdmissionYear: "Fall 2027",
      targetSemester:      "Fall",
      targetYear:          2027,
      undergraduateMajor:  "Computer Science",
      targetDegreeField:   "MS in Computer Science",
      currentGPA:          3.7,
      maxGPA:              4.0,
      targetCountries:     ["USA", "Canada", "Germany"],
      isOnboarded:         false,
    },
  })

  console.log("Seeded dev profile:", profile.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
