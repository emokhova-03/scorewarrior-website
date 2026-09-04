# candidate-b-astro

Astro 7 + `@astrojs/cloudflare`, deployed as a Cloudflare Worker with static
assets. This is one of two candidate implementations in the repo; the other is
a Go app at the repository root.

The site is a parity rebuild of scorewarrior.com. Design tokens are measured
from the original's Webflow bundle — see `docs/design-tokens.md`, which records
the source selector for every value.

## Commands

```
npm run check    # wrangler types && astro check
npm run test     # vitest run
npm run build    # wrangler types && astro build
npm run dev      # astro dev
npm run deploy   # build with BUILD_SHA set, then wrangler deploy
```

`deploy` exists so `BUILD_SHA` cannot be forgotten. `/api/health.json` reports
it, and PRD §8 uses it to detect drift between what is deployed and what is in
the repo; a plain `wrangler deploy` would leave it at the schema default
`"local"` and the health endpoint would be lying. Deploy from a clean, pulled
`main`, or the SHA names a commit nobody else has.

Run `npm run dev` in the foreground, in its own terminal. Do not put it in
background mode: it holds port 4321 without showing its banner, and a
background server plus a concurrent `npm run build` will rewrite
`node_modules/.vite` underneath the running server and break every route with
"file does not exist … which is in the optimize deps directory". If that
happens, stop the server, `rm -rf node_modules/.vite .astro`, and restart.

Never run `npm run build` while a dev server is up.

## Standards

- **TypeScript is strict** (`astro/tsconfigs/strict`). No `any`.
- **Validate every external input with Zod at the boundary**, and infer the
  static type from the schema with `z.infer` — never hand-write a type that
  duplicates a schema. `src/lib/roles/schema.ts` is the reference example.
  Schema and type cannot then drift.
- **Content lives in data files**, not in markup. Roles come from
  `data/roles.json` through the content layer.
- **Mobile-first, from 360px.** Every page must work at 360px with no
  horizontal scroll, and every tap target must be at least 44px.
- **Platform configuration lives in the repo** — `wrangler.jsonc`,
  `public/_headers`. A change made in the Cloudflare dashboard does not count
  as done: it is invisible to review and gone on the next deploy.
- **Secrets only via `wrangler secret` and `.dev.vars`.** Never in the repo,
  never in `wrangler.jsonc` `vars`.
- Styling is scoped `<style>` blocks in `.astro` components using the CSS
  variables from `src/styles/tokens.css`. No Tailwind, no CSS framework.

## Do not do this

- **Do not reconnect the Cloudflare Workers Git integration.** It was attached
  in the dashboard, never built successfully, and was disconnected on purpose
  on 04.09.2026. It ran `npm run build` at `/opt/buildhome/repo`, where there
  is no `package.json` — this project lives in `candidate-b-astro/` and the
  repository root is the Go candidate — so every push failed with ENOENT and
  hung a red cross on the pull request. Fixing it would have meant a root
  directory and a `TURNSTILE_SECRET` build variable configured in the
  dashboard, i.e. two pieces of build configuration invisible to review, which
  is exactly what the "platform configuration lives in the repo" rule below
  forbids. Deploys are `npm run deploy`, run deliberately. If they should ever
  be automated, automate them in `.github/workflows/`, where the config is
  reviewable.
- **Do not add `not_found_handling` to the `assets` block** in
  `wrangler.jsonc`. It is omitted deliberately.
- **`Astro.locals.runtime.env` is removed.** Read bindings with
  `import { env } from "cloudflare:workers"`.
- **Keep `imageService: "compile"`** in the adapter options. The default in
  adapter v13+ processes images per request through the Cloudflare Images
  binding; the art here never changes, so paying per view is waste.
- **Self-host third-party assets instead of widening the CSP.** The policy in
  `public/_headers` is `default-src 'self'` and the only external origin is
  `https://challenges.cloudflare.com` for Turnstile. Inter is self-hosted via
  `@fontsource-variable/inter` for exactly this reason. Note that package
  declares the family as `"Inter Variable"`, not `"Inter"`.
- **Do not touch the Go candidate** at the repository root (`cmd/`, `go.mod`,
  `templates/`, `web/`, and the root-level `data/`).
- **Exactly two pages are server-rendered**: `/careers` and `/careers/[slug]`,
  both with `export const prerender = false`. Everything else is static by
  default, and nothing else should become server-rendered without a reason
  traceable to the PRD. The API routes under `src/pages/api/` are endpoints,
  not pages, and are separate from that count.
- Do not commit `docs/reference/` — those are local-only parity screenshots,
  and they are gitignored.

## Layout

```
src/
  components/          shell + reusable section components
    sections/          Section, Gallery, LogoRow, QuoteCard, OfficeCard, TimelineList
  layouts/             BaseLayout — head, OG/canonical, header, footer
  lib/
    roles/             schema, loader, KV snapshot read/refresh
    apply/             application form schema
  pages/
    api/               endpoints: roles, health, ping, apply
    careers/           index + [slug], the only server-rendered pages
  styles/              tokens.css (measured), global.css
docs/
  design-tokens.md     measured values with provenance
  backlog.md           parity gaps and follow-ups
  reference/           local-only screenshots of the original (gitignored)
```

`src/worker.ts` is the Worker entry: it forwards `fetch` to Astro's handler and
adds the `scheduled` handler that refreshes the roles snapshot in KV.

`CLAUDE.md` is a symlink to this file, so both names serve the same content.
