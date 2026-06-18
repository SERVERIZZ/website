import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SERVERIZZ SectionEyebrow — the mono `// SECTION_LABEL` kicker that opens
 * nearly every section. Renders the leading `//` automatically.
 */
export interface SectionEyebrowProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  slashes?: boolean;
  tone?: "accent" | "green" | "muted";
}

export function SectionEyebrow({
  children,
  slashes = true,
  tone = "accent",
  className,
  ...props
}: SectionEyebrowProps) {
  return (
    <span className={cn("szz-eyebrow", `szz-eyebrow--${tone}`, className)} {...props}>
      {slashes ? "// " : ""}
      {children}
    </span>
  );
}
