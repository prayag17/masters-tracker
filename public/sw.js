/**
 * MastersTrack Service Worker
 * Handles: push notifications, offline caching, install prompt
 */

const CACHE_NAME = "masterstrack-v1"

// App-shell routes to cache on install
const PRECACHE_URLS = [
  "/",
  "/universities",
  "/planner",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ─── Fetch (network-first for API, cache-first for assets) ───────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET, cross-origin, and Clerk auth requests
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/sign-")
  ) {
    return
  }

  // Stale-while-revalidate for navigation
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request)
      const networkFetch = fetch(event.request)
        .then((res) => {
          if (res.ok) cache.put(event.request, res.clone())
          return res
        })
        .catch(() => cached)
      return cached ?? networkFetch
    })
  )
})

// ─── Push notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: "MastersTrack", body: event.data.text(), data: { url: "/" } }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon    ?? "/icons/icon-192.png",
      badge:   data.badge   ?? "/icons/icon-192.png",
      data:    data.data    ?? { url: "/" },
      vibrate: [100, 50, 100],
      actions: [
        { action: "open",    title: "Open app" },
        { action: "dismiss", title: "Dismiss"  },
      ],
    })
  )
})

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "dismiss") return

  const targetUrl = event.notification.data?.url ?? "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus()
          client.navigate(targetUrl)
          return
        }
      }
      // Open new window
      if (clients.openWindow) return clients.openWindow(targetUrl)
    })
  )
})
