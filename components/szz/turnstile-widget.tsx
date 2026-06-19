"use client";

import * as React from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const SCRIPT_BASE = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SCRIPT_SRC = `${SCRIPT_BASE}?onload=onloadTurnstileCallback&render=explicit`;

/**
 * Renders the real Cloudflare Turnstile managed widget and reports the token via
 * onVerify. Loads the Turnstile script once; cleans up its widget on unmount.
 */
export function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
}: {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | null>(null);
  // Keep the latest callbacks without re-rendering the widget.
  const onVerifyRef = React.useRef(onVerify);
  const onExpireRef = React.useRef(onExpire);
  React.useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  });

  React.useEffect(() => {
    function render() {
      if (!ref.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => onExpireRef.current(),
        "error-callback": () => onExpireRef.current(),
      });
    }

    if (window.turnstile) {
      render();
    } else {
      window.onloadTurnstileCallback = render;
      if (!document.querySelector(`script[src^="${SCRIPT_BASE}"]`)) {
        const s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  return <div ref={ref} style={{ minHeight: 65 }} />;
}
