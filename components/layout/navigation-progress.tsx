"use client"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function NavigationProgress() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)
  const active = useRef(false)

  function start() {
    if (active.current) return
    active.current = true
    setVisible(true)
    setWidth(8)
    interval.current = setInterval(() => {
      setWidth((w) => (w >= 85 ? 85 : w + Math.random() * 12 + 3))
    }, 350)
  }

  function finish() {
    if (interval.current) clearInterval(interval.current)
    active.current = false
    setWidth(100)
    setTimeout(() => { setVisible(false); setWidth(0) }, 350)
  }

  // Fires when navigation completes
  useEffect(() => { finish() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Intercept internal link clicks to start the bar
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute("href") ?? ""
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return
      start()
    }
    window.addEventListener("click", onClick)
    return () => window.removeEventListener("click", onClick)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] h-[2px] pointer-events-none">
      <div
        className="h-full bg-primary transition-[width] duration-300 ease-out"
        style={{
          width: `${width}%`,
          boxShadow: "0 0 10px 1px hsl(var(--primary) / 0.6)",
        }}
      />
    </div>
  )
}
