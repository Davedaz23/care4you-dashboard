import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-transparent",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-blue-600 data-[state=checked]:text-white focus:ring-blue-500",
        destructive: "data-[state=checked]:bg-red-600 data-[state=checked]:text-white focus:ring-red-500",
        outline: "data-[state=checked]:bg-gray-100 data-[state=checked]:text-gray-900 focus:ring-gray-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof checkboxVariants> {
  asChild?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "input"
    return (
      <Comp
        type="checkbox"
        className={cn(
          checkboxVariants({ variant, className }),
          "appearance-none relative inline-flex items-center justify-center",
          "transition-colors duration-200 ease-in-out"
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox, checkboxVariants }