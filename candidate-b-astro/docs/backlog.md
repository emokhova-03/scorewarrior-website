# Visual review backlog

Date: 2026-09-01

## Home `/`

- [ ] H1:
- [ ] Section spacing:
- [ ] Muted text:
- [ ] Mobile 375px:
- [ ] Other:

## Company `/company`

- [ ] H1:
- [ ] Section spacing:
- [ ] Muted text:
- [ ] Mobile 375px:
- [ ] Other:

## Game `/game`

- [ ] H1:
- [ ] Section spacing:
- [ ] Muted text:
- [ ] Mobile 375px:
- [ ] Gallery:
- [ ] Other:

## Contacts `/contacts`

- [ ] H1:
- [ ] Section spacing:
- [ ] Muted text:
- [ ] Mobile 375px:
- [ ] Other:

## Top 3 to fix

1.
2.
3.

## Deliberate deviations from the original

Kept here so a reviewer can tell an intentional difference from a mistake.

- **Gallery arrows stay visible at every width.** The original hides them below
  767px (`.hide-mobile-landscape { display: none }`) and offers its `slide-nav`
  dots as the affordance instead. We have no dots, so hiding the arrows would
  leave the scroll-snap track with no visible cue at all — worse than the
  original rather than equal to it. Revisit if the dots get built.
- **Footer copyright derives the year.** The original hardcodes 2025 and is now
  a year stale.
- **Footer links grow to a 44px tap target below 767px.** The original's are
  ~37px, under the floor this project holds itself to.
- **Hero clearance is a floor, not a fixed pad.** Below 767px the original's
  7rem section padding drops to 4rem against an 84px fixed header, so the
  header would overlap; ours takes `max()` of the two.

## Later

- Dark theme — post-demo idea only. The original scorewarrior.com has a single
  light theme and no toggle, and neither does this project: what looked like a
  theme switch during review was Astro's dev error overlay. If it is ever
  wanted it is new design work, not parity work, so it needs its own palette
  measured from somewhere other than the original.
- `src/node_modules/.vite` keeps reappearing inside `src/`. Its contents are
  all dev-toolbar modules — `astro_runtime_client_dev-toolbar_entrypoint`,
  `audit-*`, `aria-query`, `axobject-query` — so `astro dev` is what writes it,
  when the toolbar's client bundle triggers an optimizeDeps pass whose root
  resolves to `src/` instead of the project root. `npm run build` and
  `npm run check` do not recreate it. Gitignored for now; the root resolution
  is the actual thing to fix.
- Reference screenshots are local-only; downsample and commit them if the
  parity work continues past the demo.
- gallery lightbox — the original has none, would be a deliberate divergence;
  needs a script and a CSP review.
- gallery dots (slide-nav) — would let the arrows hide on mobile as the
  original does.
- company page: the original has a gallery18 team slider; we render a single
  office photo. Blocked on fetching ~13 photos — add them to
  scripts/fetch-assets.sh.
- careers: mission block, stats row (2015 / Limassol / 200+ / 30m+) and nine
  perks cards — copy exists on the original, icons already in public/perks/,
  needs a perks data file.
- Component scripts are external files because the CSP forbids inline scripts;
  revisit if we ever adopt nonce-based CSP, which needs every page
  server-rendered.
- Retire `--s-3` (0.75rem). It has no equivalent in the original's base spacing
  scale — it is only the ≤767px step of `.margin-xsmall`. Ten component
  declarations still use it.
