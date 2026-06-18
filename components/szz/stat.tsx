import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SERVERIZZ Stat — a big headline number with a caption. `mono` renders the
 * figure in JetBrains Mono (the data voice); `display` renders it in Sora
 * (the marketing voice).
 */
const SIZES = { sm: 28, md: 40, lg: 48 } as const;

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode;
  label: React.ReactNode;
  variant?: "mono" | "display";
  tone?: "accent" | "warning" | "success";
  size?: keyof typeof SIZES;
  center?: boolean;
}

export function Stat({
  value,
  label,
  variant = "mono",
  tone,
  size = "md",
  center = false,
  className,
  ...props
}: StatProps) {
  return (
    <div
      className={cn("szz-stat", `szz-stat--${variant}`, center && "szz-stat--center", className)}
      {...props}
    >
      <span
        className={cn("szz-stat__value", tone && `szz-stat__value--${tone}`)}
        style={{ fontSize: SIZES[size] }}
      >
        {value}
      </span>
      <span className="szz-stat__label">{label}</span>
    </div>
  );
}
