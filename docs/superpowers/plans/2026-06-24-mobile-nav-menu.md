# Mobile Navigation Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive collapsed nav bar with a full-screen overlay menu below 900px, leaving the desktop nav unchanged above it.

**Architecture:** Add two responsive helper classes (plus a nav-padding rule) to `app/globals.css` that toggle `display` at a 900px breakpoint. In `components/szz/site-nav.tsx`, tag the existing desktop link group and actions cluster with `.szz-nav-desktop`, add a `.szz-nav-mobile` cluster (Get Started + hamburger), lift an `open` state into `SiteNav`, and render a new in-file `MobileNav` full-screen overlay component.

**Tech Stack:** Next.js 16, React 19, TypeScript, lucide-react icons, custom CSS design tokens (no UI library, no Tailwind classes in the nav).

## Global Constraints

- Component file is `"use client"` — keep it that way.
- No new dependencies. Use existing `lucide-react`, `Button`, `ThemeToggle`, `TerminalLogo`.
- Styling: inline styles + CSS custom properties (`var(--szz-*)`). No Tailwind utility classes in nav markup.
- Breakpoint: `max-width: 900px` = mobile. Desktop appearance above 900px must not change.
- Single source of truth for links: reuse the existing `NAV_LINKS` array. Do not duplicate it.
- No component-level automated test harness exists (no jsdom/testing-library). Per-task verification = `npm run lint` + `npm run build` + manual browser check. Do not add a test harness.
- Active-route logic must match existing rules: `/` and `/hosting` use exact equality (`pathname === href`); all others use `pathname.startsWith(href)`.
- This work is on branch `feat/mobile-nav-menu`. Do NOT push to `main` (main auto-deploys to prod).

---

### Task 1: Responsive CSS helper classes

**Files:**
- Modify: `app/globals.css` (insert after line 385, the `.szz-nav-link:hover` rule)

**Interfaces:**
- Consumes: nothing.
- Produces: CSS classes `.szz-nav-desktop`, `.szz-nav-mobile`, and `.szz-nav--mobile-pad` used by Task 3.
  - `.szz-nav-desktop` — `display: flex` on desktop, `display: none !important` at `max-width: 900px`.
  - `.szz-nav-mobile` — `display: none` on desktop, `display: flex !important` at `max-width: 900px`.
  - `.szz-nav--mobile-pad` — reduces `<nav>` padding at `max-width: 900px`.

- [ ] **Step 1: Add the classes**

In `app/globals.css`, immediately after the line:

```css
.szz-nav-link:hover { color: var(--szz-text-primary) !important; }
```

insert:

```css
/* ---------- Responsive nav (mobile menu) ---------- */
.szz-nav-desktop { display: flex; }
.szz-nav-mobile { display: none; }
@media (max-width: 900px) {
  .szz-nav-desktop { display: none !important; }
  .szz-nav-mobile { display: flex !important; }
  .szz-nav--mobile-pad { padding: 12px 20px !important; }
}
```

Note: `!important` is required because the nav containers set `display`/`padding`
via inline styles, which otherwise outrank a plain class.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: PASS (no new errors).

- [ ] **Step 3: Build (verifies CSS compiles via Tailwind/PostCSS)**

Run: `npm run build`
Expected: build completes successfully.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat(nav): responsive show/hide helper classes for mobile menu"
```

---

### Task 2: MobileNav full-screen overlay component

**Files:**
- Modify: `components/szz/site-nav.tsx` (add imports; add `MobileNav` component above `SiteNav`)

**Interfaces:**
- Consumes: `NAV_LINKS`, `NavItem`/`NavGroup` types, `TerminalLogo`, `ThemeToggle`, `Button`, `Link` (all already in the file); `Menu`, `X` icons from `lucide-react` (add `Menu`, `X` to the existing import).
- Produces: `function MobileNav({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }): React.ReactElement | null` — rendered by `SiteNav` in Task 3.

- [ ] **Step 1: Extend the lucide-react import**

Change the existing import line:

```tsx
import { ChevronDown, Globe, LayoutTemplate, type LucideIcon } from "lucide-react";
```

to:

```tsx
import { ChevronDown, Globe, LayoutTemplate, Menu, X, type LucideIcon } from "lucide-react";
```

- [ ] **Step 2: Add the `MobileNav` component**

Insert this component definition immediately **above** `export function SiteNav()`:

```tsx
function MobileNav({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const [hostingOpen, setHostingOpen] = React.useState(false);

  // Escape closes the overlay; body scroll is locked while it is open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="mobile-nav"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "var(--szz-bg-page)",
        display: "flex",
        flexDirection: "column",
        padding: "16px 20px 32px",
        overflowY: "auto",
      }}
    >
      {/* top row: logo + close */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          onClick={onClose}
          style={{ display: "flex", alignItems: "center" }}
        >
          <TerminalLogo size={24} />
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--szz-text-primary)",
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* links */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginTop: 24,
        }}
      >
        {NAV_LINKS.map((link) => {
          if ("items" in link) {
            return (
              <div
                key={link.label}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <button
                  type="button"
                  aria-expanded={hostingOpen}
                  onClick={() => setHostingOpen((v) => !v)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--szz-text-primary)",
                    padding: "12px 0",
                  }}
                >
                  {link.label}
                  <ChevronDown
                    size={20}
                    style={{
                      transform: hostingOpen ? "rotate(180deg)" : "none",
                      transition: "transform .15s ease",
                    }}
                  />
                </button>
                {hostingOpen && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      paddingLeft: 16,
                      paddingBottom: 8,
                    }}
                  >
                    {link.items.map((it) => {
                      const active =
                        it.href === "/hosting"
                          ? pathname === "/hosting"
                          : pathname.startsWith(it.href);
                      return (
                        <Link
                          key={it.href}
                          href={it.href}
                          onClick={onClose}
                          className="szz-nav-link"
                          data-active={active}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                            fontFamily: "var(--font-body)",
                            fontSize: 16,
                            fontWeight: 500,
                            color: active
                              ? "var(--szz-text-primary)"
                              : "var(--szz-text-muted)",
                            padding: "10px 0",
                          }}
                        >
                          {it.Icon && (
                            <it.Icon
                              size={18}
                              style={{
                                flexShrink: 0,
                                color: "var(--szz-accent-blue)",
                              }}
                            />
                          )}
                          {it.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="szz-nav-link"
              data-active={active}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 20,
                fontWeight: 600,
                color: active
                  ? "var(--szz-text-primary)"
                  : "var(--szz-text-muted)",
                padding: "12px 0",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid var(--szz-border-subtle)",
        }}
      >
        <Link
          href="/login"
          onClick={onClose}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 16,
            fontWeight: 500,
            color: "var(--szz-text-primary)",
          }}
        >
          Log In
        </Link>
        <Button
          asChild
          variant="primary"
          size="md"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Link href="/register" onClick={onClose}>
            Get Started
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: PASS. (`MobileNav` is defined but not yet used — this is fine; it is wired up in Task 3. If lint flags it as unused, proceed to Task 3 which consumes it, then re-lint.)

- [ ] **Step 4: Typecheck via build**

Run: `npm run build`
Expected: build completes. If an "unused `MobileNav`" error blocks the build, do Task 3 before committing and run the build once after Task 3 instead. Otherwise commit now.

- [ ] **Step 5: Commit**

```bash
git add components/szz/site-nav.tsx
git commit -m "feat(nav): add MobileNav full-screen overlay component"
```

---

### Task 3: Wire the collapsed bar and overlay into SiteNav

**Files:**
- Modify: `components/szz/site-nav.tsx` (`SiteNav` function body)

**Interfaces:**
- Consumes: `MobileNav` from Task 2; `.szz-nav-desktop`, `.szz-nav-mobile`, `.szz-nav--mobile-pad` from Task 1; `Menu` icon (imported in Task 2).
- Produces: final responsive nav. No exports change.

- [ ] **Step 1: Add open state**

In `SiteNav`, just below the existing hooks, add the menu state:

```tsx
  const pathname = usePathname();
  const maintenance = useMaintenanceStatus();
  const [menuOpen, setMenuOpen] = React.useState(false);
```

- [ ] **Step 2: Add the mobile-pad class to the `<nav>`**

Change the opening `<nav>` tag to add `className="szz-nav--mobile-pad"`:

```tsx
      <nav
        className="szz-nav--mobile-pad"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "16px 48px",
          maxWidth: 1280,
          margin: "0 auto",
          flexWrap: "wrap",
          rowGap: 10,
        }}
      >
```

- [ ] **Step 3: Tag the desktop link group**

Add `className="szz-nav-desktop"` to the link-group `<div>` and remove its inline `display: "flex"` (the class now owns `display`). The other inline props stay:

```tsx
        <div className="szz-nav-desktop" style={{ alignItems: "center", gap: 4 }}>
          {NAV_LINKS.map((link) =>
            "items" in link ? (
              <NavDropdown
                key={link.label}
                label={link.label}
                items={link.items}
                pathname={pathname}
              />
            ) : (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href)
                }
              />
            )
          )}
        </div>
```

- [ ] **Step 4: Tag the desktop actions cluster**

Add `className="szz-nav-desktop"` to the actions `<div>` and remove its inline `display: "flex"`:

```tsx
        <div className="szz-nav-desktop" style={{ alignItems: "center", gap: 16 }}>
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--szz-text-primary)",
            }}
          >
            Log In
          </Link>
          <Button asChild variant="primary" size="sm">
            <Link href="/register">Get Started</Link>
          </Button>
          <ThemeToggle />
        </div>
```

- [ ] **Step 5: Add the mobile cluster (Get Started + hamburger)**

Immediately after the desktop actions `<div>` (still inside `<nav>`), add:

```tsx
        <div className="szz-nav-mobile" style={{ alignItems: "center", gap: 12 }}>
          <Button asChild variant="primary" size="sm">
            <Link href="/register">Get Started</Link>
          </Button>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--szz-text-primary)",
            }}
          >
            <Menu size={24} />
          </button>
        </div>
```

- [ ] **Step 6: Render the overlay**

Immediately after the closing `</nav>` tag (still inside the outer sticky `<div>`), add:

```tsx
      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
      />
```

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: build completes successfully.

- [ ] **Step 9: Manual verification (dev server)**

Run: `npm run dev`, open the site, and confirm:
- Above 900px: nav looks exactly as before (links + Log In + Get Started + theme toggle, no hamburger, no wrapping).
- Below 900px: only logo + Get Started + hamburger show; nothing wraps.
- Tap hamburger → full-screen overlay opens; logo + X at top, large stacked links, Log In, full-width Get Started, theme toggle.
- "Hosting" row expands/collapses Shared + WordPress; tapping a sub-link navigates and closes the overlay.
- Tapping any link closes the overlay; X closes it; Escape closes it.
- Page body does not scroll while the overlay is open; scrolling is restored after close.
- Active route is highlighted both in desktop nav and in the overlay.
- Overlay is readable in both light and dark themes (toggle inside the overlay).

- [ ] **Step 10: Commit**

```bash
git add components/szz/site-nav.tsx
git commit -m "feat(nav): collapse nav into hamburger + overlay below 900px"
```

---

## Self-Review Notes

- **Spec coverage:** full-screen overlay (Task 2), 900px single breakpoint (Task 1), collapsed bar = logo + Get Started + hamburger (Task 3 steps 5/desktop logo unchanged), Hosting accordion (Task 2), Log In/Get Started/theme toggle in overlay (Task 2), Escape + scroll lock (Task 2), aria attributes (Tasks 2 & 3), active-route reuse (Tasks 2 & 3), CSS-media-query technique (Task 1). All covered.
- **Placeholders:** none — every code step shows complete code.
- **Type consistency:** `MobileNav({ open, onClose, pathname })` defined in Task 2 matches the call in Task 3 step 6. Class names `.szz-nav-desktop` / `.szz-nav-mobile` / `.szz-nav--mobile-pad` are consistent between Task 1 and Task 3.
- **Testing note:** no React component test harness in this repo; verification is lint + build + manual, consistent with the project (only `lib/` and API routes have unit tests).
