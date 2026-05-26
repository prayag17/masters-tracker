"use client"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

interface HeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function Header({ title, description, actions, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 shrink-0 h-14 flex items-center px-6 gap-4",
        "bg-white/30 dark:bg-white/[0.03]",
        "backdrop-blur-xl",
        "border-b border-white/50 dark:border-white/[0.07]",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-foreground leading-none tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-none truncate">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  )
}
