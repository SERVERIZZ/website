import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCcVisa,
  faCcMastercard,
  faCcDiscover,
  faCcAmex,
  faCcPaypal,
} from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Accepted payment methods, rendered as Font Awesome brand glyphs.
const MARKS: { icon: IconDefinition; label: string }[] = [
  { icon: faCcVisa, label: "Visa" },
  { icon: faCcMastercard, label: "Mastercard" },
  { icon: faCcDiscover, label: "Discover" },
  { icon: faCcAmex, label: "American Express" },
  { icon: faCcPaypal, label: "PayPal" },
];

export function PaymentMarks() {
  return (
    <div
      role="list"
      aria-label="Accepted payment methods"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "var(--szz-text-muted)",
      }}
    >
      {MARKS.map((m) => (
        // A role="list" requires role="listitem" children, so wrap each glyph.
        <span key={m.label} role="listitem" style={{ display: "inline-flex" }}>
          <FontAwesomeIcon
            icon={m.icon}
            role="img"
            aria-label={m.label}
            title={m.label}
            style={{ fontSize: 26 }}
          />
        </span>
      ))}
    </div>
  );
}
