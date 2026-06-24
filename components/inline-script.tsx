// Renders a synchronous inline <script> that runs during HTML parsing on hard
// loads (e.g. the anti-FOUC theme script) without React 19's dev-only
// "Encountered a script tag while rendering React component" warning.
//
// On the server the script gets type="text/javascript" so the browser executes
// it before first paint. On the client React reconciles it as type="text/plain",
// which React treats as an inert data block (not an executable script), so it
// neither warns nor needlessly re-runs on soft navigations. suppressHydrationWarning
// covers the intentional server/client type difference.
// See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
