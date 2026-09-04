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
  dots as the affordance instead. The dots exist here now, but theirs is a 20px
  hit area — fine as a redundant control beside the arrows, wrong as the only
  one on a touch screen. So the arrows stay until the dots can carry that load
  alone. See "Later".
- **The autoplaying gallery has a pause button; the original's has none.**
  WCAG 2.2.2 asks for a way to stop content that moves on its own for more
  than five seconds, and hover pausing does not satisfy it — a keyboard or
  screen-reader user never hovers. So the /company slider gets a third circle
  next to the arrows. Autoplay also never starts under `prefers-reduced-motion`
  and gives up permanently the first time the reader touches an arrow, a dot
  or the track.
- **The autoplay delay is Webflow's default, not a measurement.** 4000ms, the
  `data-delay` default for its slider component. The original's actual value
  was never read off the page — every other number in this project is measured
  and provenanced in docs/design-tokens.md, and this one is not. Read it and
  either confirm or correct `autoplay` in company.astro.
- **Footer copyright derives the year.** The original hardcodes 2025 and is now
  a year stale.
- **Footer links grow to a 44px tap target below 767px.** The original's are
  ~37px, under the floor this project holds itself to.
- **Hero clearance is a floor, not a fixed pad.** Below 767px the original's
  7rem section padding drops to 4rem against an 84px fixed header, so the
  header would overlap; ours takes `max()` of the two.

## Later

- Protect `main` on GitHub: require the CI checks and disallow direct pushes.
  Right now `deploy.yml` runs the checks itself before publishing, so a bad
  commit cannot reach the live site — but it _can_ reach `main`, and the red
  run is then the only signal. A branch protection rule would stop it one step
  earlier. Dashboard setting, so record it here when it is set.

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
- role descriptions — 25 titles imported from the public careers page; the
  descriptions live behind their client-rendered detail pages and were not
  copied. Fill from the ATS.
- gallery lightbox — the original has none, would be a deliberate divergence;
  needs a script and a CSP review.
- gallery arrows below 767px: the dots (slide-nav) now exist, so the original's
  `.hide-mobile-landscape` behaviour is finally available — hiding the arrows
  there would no longer leave the track with no visible cue. Not done yet
  because the dots' hit area is 20px, and dropping the arrows would leave a
  sub-44px control as the only affordance on touch, which is the wrong trade.
  Revisit if the dots get a larger touch target.
- `src/assets/team/team-office.jpg` is now unreferenced — the slider replaced
  the single hero photo on /company. On the original it belongs to the
  /careers stats block; put it there with the rest of the careers work rather
  than deleting it.
- `PhotoWall.astro` is unused on purpose, not dead by accident: it is the
  no-JavaScript alternative to the slider, kept so the choice can be reversed
  by changing one import. Delete it if the slider is settled.
- careers: mission block, stats row (2015 / Limassol / 200+ / 30m+) and nine
  perks cards — copy exists on the original, icons already in public/perks/,
  needs a perks data file.
- Component scripts are external files because the CSP forbids inline scripts;
  revisit if we ever adopt nonce-based CSP, which needs every page
  server-rendered.
- Retire `--s-3` (0.75rem). It has no equivalent in the original's base spacing
  scale — it is only the ≤767px step of `.margin-xsmall`. Ten component
  declarations still use it.
