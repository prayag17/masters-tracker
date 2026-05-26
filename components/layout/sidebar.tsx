"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Building2, CalendarDays, FileText,
  Users, DollarSign, Settings, BookOpen, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { ThemeToggle } from "./theme-toggle"
import { UserButton } from "@clerk/nextjs"
import { useOnboardingGuard } from "@/hooks/use-onboarding-guard"

const NAV_ITEMS = [
  { href: "/",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/universities", label: "Universities", icon: Building2       },
  { href: "/planner",      label: "Planner",      icon: CalendarDays    },
  { href: "/sop",          label: "SOP Lab",      icon: FileText        },
  { href: "/networking",   label: "Networking",   icon: Users           },
  { href: "/finances",     label: "Finances",     icon: DollarSign      },
  { href: "/prep",         label: "Test Prep",    icon: BookOpen        },
]

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="hsl(var(--primary))" />
      <path
        d="M6 20V9L14 16.5L22 9V20"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NavLink({
  href, label, icon: Icon, isActive, isPending, collapsed, onClick,
}: {
  href: string; label: string; icon: React.ElementType
  isActive: boolean; isPending: boolean; collapsed: boolean; onClick: () => void
}) {
  return (
    <Link href={href} onClick={onClick} className="block">
      <span
        title={collapsed ? label : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-xl text-[13px] transition-all duration-150 select-none",
          collapsed ? "justify-center w-9 h-9 mx-auto" : "px-3 py-2",
          isActive
            ? "bg-primary/[0.13] dark:bg-primary/[0.20] text-primary font-semibold ring-1 ring-primary/20"
            : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent/60"
        )}
      >
        <span className="flex items-center justify-center w-4 h-4 shrink-0">
          {isPending
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Icon className="w-4 h-4" />}
        </span>
        {!collapsed && <span className="truncate leading-none">{label}</span>}
      </span>
    </Link>
  )
}

export function Sidebar() {
  useOnboardingGuard()

  const pathname  = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [pending, setPending]     = useState<string | null>(null)

  useEffect(() => { setPending(null) }, [pathname])

  function handleNav(href: string) {
    if (href !== pathname) setPending(href)
  }

  return (
    <aside className={cn(
      "relative flex flex-col shrink-0 h-screen",
      "transition-[width] duration-300 ease-in-out",
      "bg-background/90 dark:bg-[hsl(23_8%_7.5%/0.92)] backdrop-blur-xl",
      "border-r border-border/40",
      collapsed ? "w-[56px]" : "w-[220px]"
    )}>

      {/* ── Logo ──────────────────────────────────────── */}
      <div className={cn(
        "flex items-center h-14 shrink-0 border-b border-border/40",
        collapsed ? "justify-center" : "gap-3 px-4"
      )}>
        <LogoMark size={26} />
        {!collapsed && (
          <div className="flex flex-col min-w-0 leading-none">
            <span className="text-[13px] font-bold text-foreground tracking-tight">MastersTrack</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Application Suite</span>
          </div>
        )}
      </div>

      {/* ── Main nav ──────────────────────────────────── */}
      <nav className="flex-1 flex flex-col p-2 gap-0.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 pt-3 pb-1.5">
            Workspace
          </p>
        )}
        {collapsed && <div className="h-3" />}

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
            isPending={pending === item.href}
            collapsed={collapsed}
            onClick={() => handleNav(item.href)}
          />
        ))}

        {/* Divider before Settings */}
        <div className={cn("my-2 border-t border-border/40", collapsed && "mx-2")} />

        {!collapsed && (
          <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 pb-1.5">
            Account
          </p>
        )}

        <NavLink
          href="/settings"
          label="Settings"
          icon={Settings}
          isActive={pathname === "/settings"}
          isPending={pending === "/settings"}
          collapsed={collapsed}
          onClick={() => handleNav("/settings")}
        />
      </nav>

      {/* ── User strip ────────────────────────────────── */}
      <div className={cn(
        "border-t border-border/40 p-2",
        collapsed ? "flex flex-col items-center gap-2 py-3" : "flex items-center justify-between px-3 py-2.5"
      )}>
        <UserButton
          appearance={{ elements: { avatarBox: "w-7 h-7" } }}
        />
        {!collapsed && <ThemeToggle />}
        {collapsed && <ThemeToggle />}
      </div>

      {/* ── Collapse toggle ───────────────────────────── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "absolute -right-3 top-[18px] z-20",
          "flex items-center justify-center w-6 h-6 rounded-full",
          "bg-background border border-border/60 text-muted-foreground",
          "hover:text-foreground hover:border-border transition-all duration-150 shadow-sm"
        )}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
