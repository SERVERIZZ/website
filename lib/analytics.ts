// Thin gtag (GA4) event wrapper.
//
// Consent is handled implicitly: the GetTerms CMP blocker (see app/layout.tsx)
// holds the googletagmanager.com loader until the visitor consents, so until
// then `window.gtag` is undefined and every call here is a no-op. No consent →
// no gtag → no event. We never pass PII (names, emails) — GA4's Terms prohibit
// it — only the event name and non-identifying metadata.

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params?: GtagParams) => void;
  }
}

export function trackEvent(name: string, params?: GtagParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
