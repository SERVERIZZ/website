"use client";

import * as React from "react";

/** VerifyPass student/educator verification flow for the Back to School offer. */
export const VERIFY_URL = "https://verifypass.com/auth/cfb50e2df7";

const POPUP_W = 480;
const POPUP_H = 720;

/**
 * VerifyCta — the "Verify & Save 75%" call-to-action. Opens VerifyPass in a
 * small centered popup window (browser chrome stripped where allowed). Renders
 * a real anchor so middle/modified clicks, right-click "open in new tab", and
 * the no-JS case all still work; a blocked popup falls back to a new tab.
 */
export function VerifyCta({
  style,
  children,
}: {
  style: React.CSSProperties;
  children: React.ReactNode;
}) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle new-tab / new-window intents natively.
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();

    const screenLeft = window.screenLeft ?? window.screenX;
    const screenTop = window.screenTop ?? window.screenY;
    const viewW = window.innerWidth || document.documentElement.clientWidth || POPUP_W;
    const viewH = window.innerHeight || document.documentElement.clientHeight || POPUP_H;
    const left = Math.max(0, screenLeft + (viewW - POPUP_W) / 2);
    const top = Math.max(0, screenTop + (viewH - POPUP_H) / 2);

    const features = [
      "popup=yes",
      `width=${POPUP_W}`,
      `height=${POPUP_H}`,
      `left=${Math.round(left)}`,
      `top=${Math.round(top)}`,
      "menubar=no",
      "toolbar=no",
      "location=no",
      "status=no",
      "resizable=yes",
      "scrollbars=yes",
    ].join(",");

    const popup = window.open(VERIFY_URL, "verifypass", features);
    if (popup) {
      popup.focus();
    } else {
      // Popup blocked — fall back to a normal new tab.
      window.open(VERIFY_URL, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <a
      href={VERIFY_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      style={style}
    >
      {children}
    </a>
  );
}
