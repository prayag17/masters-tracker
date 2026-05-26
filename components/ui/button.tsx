import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-sm font-medium transition-all duration-150 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground border border-primary/80",
          "shadow-sm",
          "hover:opacity-90 hover:shadow-md hover:-translate-y-px",
          "active:translate-y-0 active:shadow-sm",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground border border-destructive/80",
          "shadow-sm",
          "hover:opacity-90 hover:shadow-md hover:-translate-y-px",
          "active:translate-y-0 active:shadow-sm",
        ].join(" "),
        outline: [
          "border border-border bg-background/60 text-foreground",
          "hover:bg-accent hover:text-foreground",
          "active:bg-accent/80",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground border border-border/60",
          "hover:bg-accent",
          "active:bg-accent/80",
        ].join(" "),
        ghost:  "text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg",
        link:   "text-primary underline-offset-4 hover:underline p-0 h-auto shadow-none border-0",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm:      "h-7 px-3 text-xs rounded-md",
        lg:      "h-10 px-5 text-sm",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
