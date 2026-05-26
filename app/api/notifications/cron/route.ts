/**
 * POST /api/notifications/cron
 * Called by a cron job (e.g. Vercel cron, external scheduler) to fire push notifications.
 * Requires Authorization: Bearer <CRON_SECRET> header.
 *
 * Sends:
 *   - Daily digest at any time (tasks due today)
 *   - Deadline alerts (universities with deadlines in 7, 3, or 1 day)
 *   - Weekly progress recap (Sundays)
 */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import webpush from "web-push"
import { addDays, isToday, differenceInDays, isSunday, startOfWeek, endOfWeek } from "date-fns"
import type { TaskPreview, Urgency } from "@/types";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  const secret = process.env.CRON_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { type = "daily" } = await req.json().catch(() => ({}))

  // Fetch all profiles with push subscriptions
  const profiles = await prisma.userProfile.findMany({
    where:   { pushSubscriptions: { some: {} } },
    include: {
      pushSubscriptions: true,
      universities: {
        where: {
          applicationStatus: { notIn: ["accepted", "rejected", "waitlisted"] },
        },
        select: {
          name: true,
          regularDeadline: true,
          earlyActionDeadline: true,
        },
      },
      dailyTasks: {
        where: { completed: false },
        select: { title: true, dueDate: true, urgency: true },
      },
    },
  })

  const results = { sent: 0, failed: 0, skipped: 0 }

  for (const profile of profiles) {
    let notification: { title: string; body: string; url?: string } | null = null
    const now = new Date()

    // Normalize and validate selected task fields at runtime to avoid unsafe casts
				const allowedUrgencies: Urgency[] = [
					"low",
					"medium",
					"high",
					"critical",
				];
				const isValidUrgency = (u: unknown): u is Urgency =>
					typeof u === "string" && allowedUrgencies.includes(u as Urgency);

				const normalizeTasks = (raw: unknown[]): TaskPreview[] => {
					return raw
						.map((r) => {
							const obj = r as {
								title?: unknown;
								dueDate?: unknown;
								urgency?: unknown;
							};
							return {
								title:
									typeof obj.title === "string"
										? obj.title
										: String(obj.title ?? ""),
								dueDate:
									obj.dueDate instanceof Date
										? obj.dueDate
										: String(obj.dueDate ?? ""),
								urgency: isValidUrgency(obj.urgency) ? obj.urgency : "medium",
							} as TaskPreview;
						})
						.filter(
							(t) =>
								t.title.length > 0 &&
								(typeof t.dueDate === "string" || t.dueDate instanceof Date),
						);
				};

				const tasks = normalizeTasks(profile.dailyTasks);

    if (type === "daily") {
      // Tasks due today
						const todayTasks = tasks.filter((t) =>
							isToday(new Date(t.dueDate)),
						);
      if (todayTasks.length === 0) { results.skipped++; continue }

      const urgent = todayTasks.filter(
							(t) => t.urgency === "critical" || t.urgency === "high",
						);
      notification = {
        title: `📋 ${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} due today`,
        body:  urgent.length > 0
          ? `⚡ ${urgent[0].title}${urgent.length > 1 ? ` + ${urgent.length - 1} more urgent` : ""}`
          : todayTasks[0].title,
        url: "/planner",
      }
    }

    else if (type === "deadline") {
      // Deadline alerts: 7d, 3d, 1d away
      const alerts: { uni: string; days: number }[] = []
      for (const uni of profile.universities) {
        const deadlines = [uni.regularDeadline, uni.earlyActionDeadline].filter(Boolean)
        for (const dl of deadlines) {
          const days = differenceInDays(new Date(dl!), now)
          if (days === 7 || days === 3 || days === 1) {
            alerts.push({ uni: uni.name, days })
          }
        }
      }
      if (alerts.length === 0) { results.skipped++; continue }

      const first = alerts.sort((a, b) => a.days - b.days)[0]
      notification = {
        title: `🎓 Deadline in ${first.days} day${first.days > 1 ? "s" : ""}`,
        body:  `${first.uni} application deadline is approaching`,
        url:   "/universities",
      }
    }

    else if (type === "weekly" && isSunday(now)) {
      const weekStart = startOfWeek(now)
      const weekEnd   = endOfWeek(now)
      const completedThisWeek = tasks.filter((t) => {
							// We'd need completedAt — using dueDate as proxy for weekly count
							const d = new Date(t.dueDate);
							return d >= weekStart && d <= weekEnd;
						}).length;

      const allUnis = await prisma.university.findMany({
        where:  { profileId: profile.id },
        select: { applicationStatus: true },
      })
      const applied = allUnis.filter((u) => u.applicationStatus === "applied").length

      notification = {
        title: "📊 Weekly progress recap",
        body:  `${completedThisWeek} tasks this week · ${applied} programs applied`,
        url:   "/",
      }
    }

    if (!notification) { results.skipped++; continue }

    const payload = JSON.stringify({
      title: notification.title,
      body:  notification.body,
      icon:  "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data:  { url: notification.url ?? "/" },
    })

    // Send to all subscriptions for this profile
    for (const sub of profile.pushSubscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        results.sent++
      } catch (e: unknown) {
        // Remove expired/invalid subscriptions
        const status = (e as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } })
        }
        results.failed++
      }
    }
  }

  return NextResponse.json({ ok: true, type, ...results })
}
