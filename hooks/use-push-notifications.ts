"use client"
import { useState, useEffect, useCallback } from "react"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

type PushState = "unsupported" | "prompt" | "granted" | "denied" | "loading"

export function usePushNotifications() {
  const [state, setState] = useState<PushState>("loading")
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported")
      return
    }

    // Register service worker
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const existing = await reg.pushManager.getSubscription()
      if (existing) {
        setSubscription(existing)
        setState("granted")
      } else {
        const perm = Notification.permission
        setState(perm === "denied" ? "denied" : "prompt")
      }
    })
  }, [])

  const subscribe = useCallback(async () => {
    setState("loading")
    try {
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) throw new Error("VAPID key not configured")

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      // Persist to server
      await fetch("/api/push/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          endpoint:  sub.endpoint,
          keys:      { p256dh: sub.toJSON().keys?.p256dh, auth: sub.toJSON().keys?.auth },
          userAgent: navigator.userAgent,
        }),
      })

      setSubscription(sub)
      setState("granted")
    } catch (e) {
      console.error("Push subscribe failed:", e)
      setState(Notification.permission === "denied" ? "denied" : "prompt")
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return
    setState("loading")
    try {
      await fetch("/api/push/unsubscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ endpoint: subscription.endpoint }),
      })
      await subscription.unsubscribe()
      setSubscription(null)
      setState("prompt")
    } catch (e) {
      console.error("Push unsubscribe failed:", e)
      setState("granted")
    }
  }, [subscription])

  return { state, subscription, subscribe, unsubscribe }
}
