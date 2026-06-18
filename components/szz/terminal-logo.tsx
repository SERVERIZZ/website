import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SERVERIZZ TerminalLogo — the brand mark. A miniature terminal chip with
 * red/yellow/green traffic lights over a `$ szz` prompt, optionally paired
 * with the SERVERIZZ wordmark.
 */
export interface TerminalLogoProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  wordmark?: boolean;
  size?: number;
}

export function TerminalLogo({
  wordmark = true,
  size = 24,
  className,
  ...props
}: TerminalLogoProps) {
  const scale = size / 24;
  const promptSize = Math.round(7 * scale * 1.1);
  const wordSize = Math.round(18 * scale);
  return (
    <span className={cn("szz-logo", className)} {...props}>
      <span
        className="szz-logo__chip"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: "left center",
        }}
      >
        <span className="szz-logo__lights">
          <span style={{ background: "var(--szz-red)" }} />
          <span style={{ background: "var(--szz-yellow)" }} />
          <span style={{ background: "var(--szz-green)" }} />
        </span>
        <span className="szz-logo__prompt" style={{ fontSize: promptSize }}>
          <span className="d">$</span>
          <span className="n">szz</span>
        </span>
      </span>
      {wordmark && (
        <span className="szz-logo__word" style={{ fontSize: wordSize }}>
          SERVERIZZ
        </span>
      )}
    </span>
  );
}
