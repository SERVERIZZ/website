/** Renders pre-sanitized WordPress HTML inside the branded prose container. */
// Safe: `html` is produced by `renderProse` (lib/wp-prose.ts), which sanitizes
// via rehype-sanitize before returning. No raw CMS output reaches this component.
export function BlogProse({ html }: { html: string }) {
  return <div className="szz-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
