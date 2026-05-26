import express from "express"
import { scrapeUniversity } from "./scrapers/university.js"
import type { ScrapeRequest } from "./types.js"

const app = express()
app.use(express.json())

const PORT = process.env.PORT ?? 3001

app.get("/health", (_, res) => res.json({ status: "ok", service: "masters-tracker-scraper" }))

app.post("/scrape", async (req, res) => {
  const body = req.body as ScrapeRequest

  if (!body.universityName || !body.programName) {
    return res.status(400).json({ error: "universityName and programName are required" })
  }

  console.log(`[scraper] Starting: ${body.universityName} — ${body.programName}`)

  try {
    const result = await scrapeUniversity(body)
    console.log(`[scraper] Done: ${body.universityName}`, {
      deadline: result.regularDeadline,
      fee: result.applicationFee,
    })
    res.json(result)
  } catch (e) {
    console.error(`[scraper] Failed: ${body.universityName}`, e)
    res.status(500).json({ error: String(e) })
  }
})

app.listen(PORT, () => {
  console.log(`[scraper] Service running on port ${PORT}`)
})
