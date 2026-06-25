# SERVERIZZ — Marketing Site

The public marketing and self-service site for **SERVERIZZ**, managed hosting for small business — [www.serverizz.com](https://www.serverizz.com).

Built with Next.js (App Router) and TypeScript. It serves the marketing pages, a headless-WordPress blog, and a handful of self-service flows (domain search, registration, login, support tickets) that talk to the ClientExec billing platform.

> **Heads up for contributors and agents:** this repo pins a recent Next.js (`16.2.9`) whose APIs and conventions may differ from older docs. Read the relevant guide in `node_modules/next/dist/docs/` before writing code, and heed deprecation notices. See [`AGENTS.md`](./AGENTS.md).

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, shadcn-style primitives (`components/ui`) |
| Icons | Lucide, Font Awesome 7 (brand icons) |
| Content | Headless WordPress REST API (ISR) |
| SEO | `next-seo` v7 (JSON-LD) + native Metadata API |
| Markup pipeline | `unified` / `rehype` (sanitize, slug, prose mapping) |
| Tests | Vitest |
| Runtime | Node ≥ 20 |

Fonts are Sora (display), Inter (body), and JetBrains Mono (terminal UI), loaded via `next/font`.

## Project layout

```
app/
  (site)/            # Marketing pages — home, hosting, vps, domains, about,
                     # why, data-centers, support, ai-employees, offers, legal
  (site)/blog/       # Headless-WordPress blog (index, [slug], categories, paging)
  api/               # Route handlers (see "API routes" below)
  layout.tsx         # Root layout: fonts, GA4, GetTerms CMP, Org JSON-LD
  sitemap.ts         # Dynamic sitemap
  robots.ts          # robots.txt
  not-found.tsx      # Custom 404
  opengraph-image.tsx / twitter-image.tsx   # Dynamic social cards
components/
  ui/                # Reusable primitives (button, card, input, badge)
  szz/               # Site-specific components (nav, footer, terminal,
                     # forms, pricing, impact badges, blog views, …)
lib/                 # Integrations + helpers (each with a *.test.ts)
docs/                # Design specs and implementation plans
```

Path alias `@/*` maps to the repo root (`tsconfig.json`).

## Integrations

The site is a thin front-end over several external services, each isolated in `lib/`:

- **ClientExec** (`clientexec.ts`, `domains.ts`, `login.ts`) — billing platform. Powers domain search, account login, and registration. Order URLs point at `go.serverizz.com`.
- **Headless WordPress** (`wordpress.ts`, `wp-map.ts`, `wp-prose.ts`, `blog-seo.ts`) — the `/blog` content comes from the `newsroom.serverizz.com` REST API, rendered with ISR. HTML is sanitized and re-mapped through a `rehype` pipeline.
- **Cloudflare Turnstile** (`turnstile.ts`) — bot protection on the registration form.
- **Uptime Kuma** (`uptime-kuma.ts`) — drives the maintenance-window announcement bar in the nav from the public status page JSON.
- **The Tree App** (`treeapp.ts`) — "trees planted" impact badge in the footer.
- **Google Analytics 4 + GetTerms CMP** — loaded in the root layout; GA is gated behind cookie consent.

## API routes

Server route handlers under `app/api/`:

| Route | Purpose |
| --- | --- |
| `POST /api/domain-search` | Domain availability via ClientExec |
| `POST /api/register` | Account registration (Turnstile-protected) |
| `POST /api/login` | ClientExec account login |
| `POST /api/support-ticket` | Submit a support ticket |
| `GET /api/maintenance-status` | Active maintenance window (Uptime Kuma) |
| `GET /api/impact-summary` | Trees-planted count (The Tree App) |

## Getting started

Requires Node ≥ 20.

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev                  # http://localhost:3000
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |

## Environment variables

Copy `.env.example` to `.env.local` and fill in. Summary:

| Variable | Required | Notes |
| --- | --- | --- |
| `CLIENTEXEC_URL` | yes | ClientExec base URL (non-secret) |
| `CLIENTEXEC_DOMAIN_GROUP_ID` | yes | Domain group for search (non-secret) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | yes | Turnstile site key; dev uses Cloudflare's always-pass test key |
| `TURNSTILE_SECRET_KEY` | yes | Turnstile secret; dev uses the test key |
| `TREEAPP_API_KEY` | no | Tree App impact badge; falls back to a static count if unset |
| `UPTIME_KUMA_STATUS_URL` | no | Defaults to the production status page |
| `WORDPRESS_API_URL` | yes | Headless WordPress REST base (server-only) |

`NEXT_PUBLIC_*` values are inlined into the client bundle at build time, so they must be present wherever the build runs (locally **and** in CI) — not just at runtime.

## Testing

Vitest runs in a Node environment over `**/*.test.ts(x)`. Most `lib/` modules ship with a colocated test (e.g. `clientexec.test.ts`, `wordpress.test.ts`, `domains.test.ts`).

```bash
npm test
```

## Deployment

Deploys are automated by GitHub Actions ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)) and triggered on **push to `main`** (or manual `workflow_dispatch`).

> ⚠️ Pushing to `main` deploys to production. Coordinate before pushing.

The flow, in short:

1. GitHub's runner does `npm ci` + `npm run build` (off-server — the cPanel box is memory-capped and can't run `next build`).
2. The build is streamed as a `tar` archive over SSH to the cPanel server (CageFS has no `rsync`). `node_modules`, `.env*`, and `.htaccess` are excluded so the server's copies survive; stale `.next` output is wiped first.
3. The server runs `npm install --omit=dev` and restarts Passenger via `tmp/restart.txt`.

The server **only runs** the app — it never builds. `app.js` is the Passenger/Next.js entry point. `.cpanel.yml` is deliberately restart-only, so clicking "Deploy HEAD Commit" in cPanel just reloads the app instead of attempting (and failing) a build.

## Contributing

- Read [`AGENTS.md`](./AGENTS.md) before changing framework-level code.
- Keep integrations behind their `lib/` module and add/update the colocated `*.test.ts`.
- Run `npm run lint` and `npm test` before pushing.
- Design specs and implementation plans live in `docs/`.
