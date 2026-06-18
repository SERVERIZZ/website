import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * SERVERIZZ Button — terminal-grade actions, built on the shadcn/cva pattern.
 * Visuals come from the `.szz-btn*` design-system classes (see globals.css).
 */
const buttonVariants = cva("szz-btn", {
  variants: {
    variant: {
      primary: "szz-btn--primary",
      secondary: "szz-btn--secondary",
      outline: "szz-btn--outline",
      ghost: "szz-btn--ghost",
      destructive: "szz-btn--destructive",
    },
    size: {
      sm: "szz-btn--sm",
      md: "szz-btn--md",
      lg: "szz-btn--lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
