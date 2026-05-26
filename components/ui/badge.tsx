import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border leading-none",
  {
    variants: {
      variant: {
        default:     "border-primary/20      bg-primary/10      text-primary",
        secondary:   "border-border/50       bg-muted/60        text-foreground/70",
        destructive: "border-destructive/20  bg-destructive/10  text-destructive",
        outline:     "border-border/50       bg-transparent     text-muted-foreground",
        success:     "border-emerald-500/20  bg-emerald-500/10  text-emerald-600 dark:text-emerald-400",
        warning:     "border-amber-500/20    bg-amber-500/10    text-amber-600 dark:text-amber-400",
        info:        "border-sky-500/20      bg-sky-500/10      text-sky-600 dark:text-sky-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
