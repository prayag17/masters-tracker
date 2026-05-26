---
name: project-masters-tracker
description: Masters University Application Tracker — full-stack Next.js app built in D:\InternshipScrapper\masters-tracker
metadata:
  type: project
---

Full-stack local-first application tracker scaffolded at `D:\InternshipScrapper\masters-tracker`.

**Why:** User requested comprehensive application management workspace including scraping, AI evaluation, CRM, and financial tracking.

**How to apply:** When user asks about this app, refer to the architecture below.

## Architecture

- **Frontend:** Next.js 15 App Router, React, TypeScript, TanStack Query, Tailwind CSS (dark mode only)
- **UI:** Shadcn UI (Radix Primitives) — all components in `components/ui/`
- **Database:** PostgreSQL + Prisma ORM — schema in `prisma/schema.prisma`
- **State:** TanStack Query for all server state; React Hook Form + Zod for forms
- **LLM:** Ollama (local) — `lib/llm.ts` implements 3-agent SOP evaluator (Critic + Officer + Validator)
- **Scraper:** Playwright Express service in `scraper/` — runs on port 3001

## Key Files

- `lib/planner-logic.ts` — phase computation and task generation (34 auto-tasks for 4 phases)
- `lib/llm.ts` — three-agent SOP evaluation pipeline (parallel Critic+Officer, then Validator Judge)
- `lib/utils.ts` — `getClosestDeadline`, `formatDeadline`, status/urgency color helpers
- `app/api/sop/evaluate/route.ts` — multi-agent evaluation API (calls Ollama 3×)
- `app/api/universities/[id]/scrape/route.ts` — calls scraper service
- `scraper/src/scrapers/university.ts` — Playwright scraper with regex deadline/fee extraction
- `docker-compose.yml` — Postgres + Scraper + Next.js app

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard bento grid |
| `/onboarding` | 3-step profile setup |
| `/universities` | Kanban pipeline with scraping |
| `/universities/[id]` | University detail with scraped data |
| `/planner` | Phase-aware daily task board |
| `/sop` | SOP editor + AI evaluation panel |
| `/networking` | LinkedIn CRM with templates |
| `/finances` | Expense ledger |
| `/settings` | Profile management |

## Run Commands

```bash
# Docker (recommended)
docker-compose up --build
docker-compose exec app npx prisma db push

# Local dev
npm install && npx prisma db push && npm run dev
cd scraper && npm install && npm run dev
ollama pull llama3
```
