# MastersTrack Setup Guide

## 1. Clerk Authentication

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → create a new application
2. Enable **Email/Password** + **Google** sign-in methods
3. Copy your keys into `.env`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
4. In Clerk dashboard → **Redirects**, set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/`
   - After sign-up: `/onboarding`

## 2. Database migration

```bash
pnpm db:migrate   # runs prisma migrate dev
# or if DB is already up:
pnpm db:push      # prisma db push (faster for dev)
pnpm db:generate  # regenerate prisma client
```

## 3. Push Notifications

VAPID keys are already generated in `.env`. Do not regenerate them — that invalidates existing subscriptions.

To set the cron secret, replace the placeholder in `.env`:
```
CRON_SECRET=any_random_string_here
```

### Triggering notifications

Call `POST /api/notifications/cron` with `Authorization: Bearer <CRON_SECRET>` and body `{ "type": "daily" | "deadline" | "weekly" }`.

**With Vercel cron** — add to `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/notifications/cron", "schedule": "0 8 * * *" },
    { "path": "/api/notifications/cron", "schedule": "0 9 * * 0" }
  ]
}
```
Vercel cron will automatically include the authorization header if you set `CRON_SECRET` in your Vercel project environment variables.

**With an external scheduler** (cron-job.org, Railway, etc.) — POST to your deployed URL every morning with the Bearer header.

## 4. PWA / Install on phone

Once deployed (or running locally on HTTPS):
1. Open the app in Chrome/Safari on mobile
2. Chrome: tap the menu → "Add to Home Screen"
3. Safari: tap the Share icon → "Add to Home Screen"

The app will install with offline support for cached routes.

### PWA icons

The current icons in `public/icons/` are SVG placeholder files named `.png`. For production, replace them with real PNGs:

```bash
# Using sharp (install: pnpm add -D sharp)
node scripts/generate-icons.js
```

Or use [realfavicongenerator.net](https://realfavicongenerator.net) to generate a full icon set.

## 5. CV file serving

Uploaded CVs are saved to `uploads/<clerkUserId>/cv_<timestamp>.pdf` on the server filesystem.

For production, consider:
- **Vercel**: use Vercel Blob or R2 (filesystem is ephemeral on serverless)
- **Self-hosted**: the local filesystem approach works fine with a persistent disk

## 6. Suggested next features

| Feature | Effort | Value |
|---|---|---|
| **LOR tracker** — track letter of recommendation requests, deadlines, professor contacts | Medium | High |
| **Document vault** — store transcripts, awards, certificates with tags | Medium | High |
| **University comparison table** — side-by-side GPA/GRE/tuition/deadline view | Low | High |
| **Interview prep log** — record past questions by school, write mock answers | Medium | Medium |
| **Scholarship tracker** — separate track for fellowships and scholarships | Low | Medium |
| **Application checklist per university** — required docs status (SOP, LOR, transcript, fee) | Low | High |
| **Visa/immigration checklist** — post-acceptance workflow (I-20, DS-160, OPT etc.) | Low | Medium |
| **Email template library** — cold email templates for professors, alumni | Low | Medium |
| **Peer insights** — anonymized acceptance stats from other MastersTrack users | High | High |
| **Calendar sync** — export deadlines to Google Calendar / Apple Calendar | Medium | Medium |
| **Mood/stress journal** — log how you're feeling during the application process | Low | Low |
