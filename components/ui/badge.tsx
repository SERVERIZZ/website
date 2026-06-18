import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * SERVERIZZ Badge / status pill — tinted fill + matching text, with an
 * optional leading dot for live status.
 */
const badgeVariants = cva("szz-badge", {
  variants: {
    variant: {
      neutral: "szz-badge--neutral",
      accent: "szz-badge--accent",
      success: "szz-badge--success",
      warning: "szz-badge--warning",
      error: "szz-badge--error",
      outline: "szz-badge--outline",
      solid: "szz-badge--solid",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="szz-badge__dot" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
