"use client"
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PushNotificationToggle() {
  const { state, subscribe, unsubscribe } = usePushNotifications()

  const config = {
    unsupported: {
      icon:  BellOff,
      label: "Push notifications not supported",
      sub:   "Your browser doesn't support push notifications",
      color: "text-muted-foreground",
      btn:   null,
    },
    loading: {
      icon:  Loader2,
      label: "Checking notification status…",
      sub:   "",
      color: "text-muted-foreground",
      btn:   null,
    },
    prompt: {
      icon:  Bell,
      label: "Push notifications are off",
      sub:   "Enable to get deadline alerts, daily task reminders, and weekly reports",
      color: "text-muted-foreground",
      btn:   { label: "Enable notifications", action: subscribe, variant: "default" as const },
    },
    granted: {
      icon:  BellRing,
      label: "Push notifications are on",
      sub:   "You'll receive deadline alerts, daily digests, and weekly progress reports",
      color: "text-emerald-500",
      btn:   { label: "Disable", action: unsubscribe, variant: "outline" as const },
    },
    denied: {
      icon:  BellOff,
      label: "Notifications are blocked",
      sub:   "Open your browser settings and allow notifications for this site",
      color: "text-amber-500",
      btn:   null,
    },
  }[state]

  const Icon = config.icon

  return (
    <div className="bento-card p-4 flex items-start gap-4">
      <div className={cn("flex items-center justify-center w-9 h-9 rounded-xl bg-muted/50 shrink-0", config.color)}>
        <Icon className={cn("w-4 h-4", state === "loading" && "animate-spin")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", config.color)}>{config.label}</p>
        {config.sub && <p className="text-xs text-muted-foreground mt-0.5">{config.sub}</p>}

        {state === "granted" && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["Deadline alerts (7d, 3d, 1d)", "Daily task digest", "Weekly progress report"].map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      {config.btn && (
        <Button size="sm" variant={config.btn.variant} onClick={config.btn.action}
          disabled={state === "loading"} className="shrink-0">
          {config.btn.label}
        </Button>
      )}
    </div>
  )
}
