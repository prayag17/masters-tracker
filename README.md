# MastersTrack — Application Planner

A local-first, privacy-focused Masters University Application Tracker. Everything runs on your machine — no cloud, no data sharing.

## Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, TanStack Query
- **UI:** Shadcn UI (Radix Primitives) + Tailwind CSS — dark mode by default
- **Database:** PostgreSQL + Prisma ORM
- **Scraper:** Playwright (Node.js service on port 3001)
- **LLM:** Ollama (local — llama3 or mistral)
- **DevOps:** Docker + docker-compose

---

## Quick Start (Docker — Recommended)

```bash
cd masters-tracker

# Copy and edit env if needed
cp .env.example .env

# Start all services (Postgres + Scraper + Next.js app)
docker-compose up --build -d

# Push DB schema and seed default profile
docker-compose exec app pnpm db:push
docker-compose exec app pnpm db:seed

# Open http://localhost:3000
```

> **Ollama** runs on your host machine (not in Docker). Install from https://ollama.ai then:
> ```bash
> ollama pull llama3
> ollama serve   # should already be running as a service
> ```

---

## Local Dev (No Docker)

### 1. Start PostgreSQL
```bash
docker run -d \
  --name masters_postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=masters_tracker \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Set up Next.js app
```bash
cd masters-tracker
pnpm install
cp .env.example .env   # edit DATABASE_URL if needed
pnpm db:push
pnpm db:seed
pnpm dev               # http://localhost:3000
```

### 3. Start Scraper service (separate terminal)
```bash
cd masters-tracker/scraper
pnpm install
pnpm exec playwright install chromium
pnpm dev               # http://localhost:3001
```

### 4. Start Ollama
```bash
ollama pull llama3
# Ollama runs automatically at http://localhost:11434
```

---

## Feature Overview

| Module | Description |
|--------|-------------|
| **Dashboard** | Bento grid — countdown timer, daily tasks, pipeline kanban, cost summary |
| **Universities** | Add programs, track status (Researching → Applied → Interview → Decision), auto-scrape deadlines |
| **Daily Planner** | Phase-aware task board (34 auto-generated tasks across 4 phases) |
| **SOP Lab** | Draft editor + 3-agent AI evaluation (Critic → Officer → Validator Judge) |
| **Networking CRM** | Track outreach to professors/alumni, copy-paste templates |
| **Finances** | Expense ledger across categories with paid/unpaid tracking |
| **Settings** | Profile onboarding — target intake, GPA, degree field, countries |

---

## Application Phases (Fall 2027 example)

| Phase | Period | Key Tasks |
|-------|--------|-----------|
| Pre-Application | May – Aug 2026 | GRE/TOEFL registration & exams, transcript requests |
| Shortlisting | Aug – Oct 2026 | Finalize list, professor outreach, SOP outline |
| Applications | Oct – Dec 2026 | SOP drafts, submit applications, LOR follow-ups |
| Visa & Finance | Jan – May 2027 | Decision tracking, visa application, housing |

---

## SOP Multi-Agent Pipeline

```
User SOP Draft
     │
     ├──► Agent 1 (The Critic)
     │    Evaluates: hook, flow, grammar, specificity
     │
     ├──► Agent 2 (The Admissions Officer)
     │    Evaluates: research fit, goal clarity, university alignment
     │
     └──► Agent 3 (The Validator/Judge)
          Consolidates both reports → JSON critique with:
          - Overall score (0–10)
          - Checklist (PASS/FAIL per criterion)
          - Critical issues with recommendations
          - Suggested revised structure
```

All agents run locally via **Ollama** — no data leaves your machine.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/masters_tracker` | Postgres connection |
| `SCRAPER_SERVICE_URL` | `http://localhost:3001` | Playwright scraper service |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API endpoint |
| `OLLAMA_MODEL` | `llama3` | Model for SOP evaluation |
