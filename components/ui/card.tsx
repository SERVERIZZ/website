import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SERVERIZZ Card — the workhorse surface (navy fill, steel hairline, 12px
 * radius). Mirrors the design-system Card props onto the `.szz-card*` classes.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: "card" | "deep";
  glow?: boolean;
  popular?: boolean;
  interactive?: boolean;
  flush?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      surface = "card",
      glow = false,
      popular = false,
      interactive = false,
      flush = false,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "szz-card",
        surface === "deep" && "szz-card--deep",
        flush && "szz-card--flush",
        glow && "szz-card--glow",
        popular && "szz-card--popular",
        interactive && "szz-card--interactive",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
