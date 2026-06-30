"use client";

import Script from "next/script";

declare global {
  interface Window {
    acsbJS?: {
      init: (config?: Record<string, unknown>) => void;
    };
  }
}

const ACSB_SRC = "https://acsbapp.com/apps/app/dist/js/app.js";

/**
 * accessiBe accessibility widget.
 *
 * Loaded `afterInteractive` (it's a non-critical, post-hydration enhancement)
 * and configured via `acsbJS.init`. The trigger is pinned to the bottom-left
 * and raised with `triggerOffsetY` so it floats just *above* the GetTerms
 * cookie-consent button (also bottom-left, see app/layout.tsx) rather than
 * overlapping it. `onLoad` requires a Client Component, hence "use client".
 */
export function AccessibilityWidget() {
  return (
    <Script
      id="acsb-app"
      src={ACSB_SRC}
      strategy="afterInteractive"
      onLoad={() => {
        window.acsbJS?.init({
          statementLink: "",
          feedbackLink: "",
          footerHtml: "",
          hideMobile: false,
          hideTrigger: false,
          disableBgProcess: false,
          language: "en",
          position: "left",
          leadColor: "#146FF8",
          triggerColor: "#146FF8",
          triggerRadius: "50%",
          triggerPositionX: "left",
          triggerPositionY: "bottom",
          triggerIcon: "people",
          triggerSize: "medium",
          triggerOffsetX: 20,
          // Raised above the GetTerms cookie button so they don't overlap.
          triggerOffsetY: 100,
          mobile: {
            triggerSize: "small",
            triggerPositionX: "left",
            triggerPositionY: "bottom",
            triggerOffsetX: 16,
            triggerOffsetY: 90,
            triggerRadius: "50%",
          },
        });
      }}
    />
  );
}
