# Design tokens — scorewarrior.com

**Measured 03.09.2026.**

Method: the original is a Webflow site that serves fully server-rendered HTML,
so the values below are not eyeballed from screenshots — they are quoted from
the real declarations in the stylesheet the site links on every page:

```
https://cdn.prod.website-files.com/633da33305ac754156026dd8/css/scorewarrior-cb4b17.shared.f0187b778.css
```

139 068 bytes, 1370 rules, parsed with brace-depth tracking so that every rule
keeps its `@media` context. The "Source" column names the selector each value
came from. Where a value differs per breakpoint, all steps are listed —
the original is responsive at the three Webflow breakpoints **991px**, **767px**
and **479px**.

Superseded: the 31.08.2026 measurement, taken via `getComputedStyle` on a
single desktop viewport. It got the palette right and the type scale wrong.

---

## Color

The bundle declares exactly four Webflow swatches in its own `:root`:

| Token            | Value     | Source                     |
| ---------------- | --------- | -------------------------- |
| `--black`        | `#000000` | `:root { --black }`        |
| `--white`        | `#ffffff` | `:root { --white }`        |
| `--light-grey`   | `#f4f4f4` | `:root { --light-grey }`   |
| `--dark-magenta` | `#821890` | `:root { --dark-magenta }` |

Semantic roles built on top of them:

| Token                  | Value       | Source                                                             |
| ---------------------- | ----------- | ------------------------------------------------------------------ |
| `--c-bg`               | `#ffffff`   | `body { background-color }` → `.background-color-white`            |
| `--c-bg-elevated`      | `#ffffff`   | cards have no fill of their own; they separate via border + shadow |
| `--c-text`             | `#000000`   | `body { color: var(--black) }`                                     |
| `--c-text-muted`       | `#667085`   | `.text-color-gray500`                                              |
| `--c-accent`           | `#821890`   | `.background-color-fuchsia800`, the header pill fill               |
| `--c-accent-strong`    | `#6f1877`   | `.background-color-fuchsia900`                                     |
| `--c-border`           | `#f4f4f4`   | `.background-color-gray` / role card border                        |
| `--c-nav-link`         | `#ffffff`   | `.navbar14_link.text-color-white`                                  |
| `--c-nav-link-hover`   | `#ffffff80` | `.navbar14_link.text-color-white:hover`                            |
| `--c-nav-link-current` | `#ffffffb3` | `.navbar14_link.text-color-white.w--current`                       |

Full ramps are in `tokens.css` as `--c-fuchsia-25 … 900` and
`--c-gray-25 … 900`, quoted from the `.text-color-*` / `.background-color-*`
utility classes. `#821890` is `fuchsia800`; `#667085` is `gray500`.

There is **no dark palette** in the original bundle. It is a single light theme.

---

## Typography

**Family.** `body { font-family: Inter, sans-serif }`. No heading rule declares
a family, so h1–h6 inherit it — `--font-display` is the same stack by design,
not by omission. The original loads it from Google Fonts:

```js
WebFont.load({ google: { families: ["Inter:300,400,500,600,700"] } });
```

Weight **800** exists as a `.text-weight-xbold` utility but is _not_ among the
loaded weights, so on the original it is synthesised. Don't use it.

**Body scale** — `.text-size-*`:

| Token          | ≤479px | ≤767px     | base       | Source                                     |
| -------------- | ------ | ---------- | ---------- | ------------------------------------------ |
| `--fs-tiny`    | —      | —          | `0.75rem`  | `.text-size-tiny`                          |
| `--fs-small`   | —      | —          | `0.875rem` | `.text-size-small`                         |
| `--fs-regular` | —      | —          | `1rem`     | `.text-size-regular`                       |
| `--fs-medium`  | —      | `1rem`     | `1.125rem` | `.text-size-medium`, `.text-size-medium-2` |
| `--fs-large`   | —      | `1.125rem` | `1.25rem`  | `.text-size-large`                         |

**Heading scale** — `h1`–`h6`, mirrored by `.heading-style-h1`–`h6`:

| Token     | base      | ≤991px    | ≤767px              | weight | line-height |
| --------- | --------- | --------- | ------------------- | ------ | ----------- |
| `--fs-h1` | `3.5rem`  | `3.25rem` | `2.5rem`            | 700    | 1.2         |
| `--fs-h2` | `3rem`    | `2.75rem` | `2.25rem`           | 700    | 1.2         |
| `--fs-h3` | `2.5rem`  | `2.25rem` | `2rem`              | 700    | 1.2         |
| `--fs-h4` | `2rem`    | `1.75rem` | `1.5rem` (lh → 1.4) | 700    | 1.3         |
| `--fs-h5` | `1.5rem`  | —         | `1.25rem`           | 700    | 1.4         |
| `--fs-h6` | `1.25rem` | —         | `1.125rem`          | 700    | 1.4         |

`h1` at `479px` repeats `2.5rem`, i.e. it does not shrink further.

**Weights**: 300 / 400 / 500 / 600 / 700 — `.text-weight-light` …
`.text-weight-bold`.

**Line heights**: body `1.5` (`body { line-height }`); h1–h3 `1.2`; h4 `1.3`
(`1.4` at ≤767px); h5 and h6 `1.4`.

Note the home page's `<h1>` carries `.heading-style-h2`, so the visually
largest heading there renders at 3rem, not 3.5rem.

---

## Space

`.margin-*` and `.padding-*` share one scale. It compresses twice:

| Token             | base      | ≤991px   | ≤767px    |
| ----------------- | --------- | -------- | --------- |
| `--space-tiny`    | `0.25rem` | —        | —         |
| `--space-xxsmall` | `0.5rem`  | —        | —         |
| `--space-xsmall`  | `1rem`    | —        | `0.75rem` |
| `--space-small`   | `1.5rem`  | —        | `1.25rem` |
| `--space-medium`  | `2rem`    | —        | `1.5rem`  |
| `--space-large`   | `3rem`    | `2.5rem` | `2rem`    |
| `--space-xlarge`  | `4rem`    | `3.5rem` | `2.5rem`  |
| `--space-xxlarge` | `5rem`    | `4.5rem` | `3rem`    |
| `--space-huge`    | `6rem`    | `5rem`   | `3.5rem`  |
| `--space-xhuge`   | `7rem`    | `6rem`   | `4rem`    |
| `--space-xxhuge`  | `10rem`   | `7.5rem` | `5rem`    |

Section rhythm — `.padding-section-*`, applied as symmetric vertical padding:

| Token              | base   | ≤991px | ≤767px |
| ------------------ | ------ | ------ | ------ |
| `--section-small`  | `3rem` | —      | `2rem` |
| `--section-medium` | `5rem` | `4rem` | `3rem` |
| `--section-large`  | `7rem` | `6rem` | `4rem` |

---

## Grid

| Token                | Value   | Source                                       |
| -------------------- | ------- | -------------------------------------------- |
| `--container`        | `80rem` | `.container-large { max-width }` — 1280px    |
| `--container-medium` | `64rem` | `.container-medium`                          |
| `--container-small`  | `48rem` | `.container-small`                           |
| `--gutter`           | `5%`    | `.padding-global { padding-left/right: 5% }` |

The gutter being a **percentage** is the one structural difference from our
previous guess of a fixed `1.5rem`: on the original the side margins grow with
the viewport and the container simply stops widening at 1280px.

Content clamps — `.max-width-*`: xxsmall `20rem`, xsmall `25rem`,
small `30rem`, medium `35rem`, large `48rem`, xlarge `64rem`, xxlarge `80rem`.

---

## Shell

The header is a pill floating over the page, not a bar in the flow:

| Token             | Value                     | Source                               |
| ----------------- | ------------------------- | ------------------------------------ |
| `--header-h`      | `4.5rem` → `4rem` ≤767    | `.navbar14_container { min-height }` |
| `--header-offset` | `1.5rem` → `1.25rem` ≤767 | `.navbar14_component { margin-top }` |
| `--header-space`  | offset + height           | derived — what content must clear    |

So the pill is **72px** tall on desktop and **64px** below 767px, sitting 24px
(20px on mobile) below the top edge. `.navbar14_component` is
`position: fixed; inset: 0 0 auto` with `margin-inline: 5%`; the pill itself has
`padding-inline: 2rem` (`1.25rem` ≤767px), `border-radius: 1rem`, and
`justify-content: space-between`.

Our previous `--header-h: 76px` was never measured, and the current header
renders far taller than 72px because it stacks its own vertical padding on top
of the pill — that is step 2's job.

Menu collapses at **≤991px** (`data-collapse="medium"`). Burger is 48×48 with
three 24×2 white bars (`.menu-icon2`); the open panel is
`.navbar14_menu-link-wrapper` — fuchsia800 fill, `border-radius: 0 0 1rem 1rem`,
`padding: 1rem 2rem 2.5rem`. The 48px burger already satisfies the 44px tap
target minimum; nav links at `padding: 1rem 0` and `font-size: 1.125rem` give
roughly 51px rows.

---

## Radius, shadow, motion

**Radius.** `1rem` is the dominant value (10 of 22 declarations) and is what
the header pill, buttons and cards all use. `100%`/`50%` appear for circles,
`100px` for a pill, `0 0 1rem 1rem` for the open mobile menu.

**Shadow.** A seven-step scale, verbatim:

| Token              | Value                                                  |
| ------------------ | ------------------------------------------------------ |
| `--shadow-xxsmall` | `0 1px 2px #0000000d`                                  |
| `--shadow-xsmall`  | `0 1px 3px #0000001a, 0 1px 2px #0000000f`             |
| `--shadow-small`   | `0 4px 8px -2px #0000001a, 0 2px 4px -2px #0000000f`   |
| `--shadow-medium`  | `0 12px 16px -4px #00000014, 0 4px 6px -2px #00000008` |
| `--shadow-large`   | `0 20px 24px -4px #00000014, 0 8px 8px -4px #00000008` |
| `--shadow-xlarge`  | `0 24px 48px -12px #0000002e`                          |
| `--shadow-xxlarge` | `0 32px 64px -12px #00000024`                          |

Role cards carry `.shadow-medium` (`.career23_item.shadow-medium`), so
`--shadow-card` aliases that rather than the invented one-liner it used before.

**Motion.** The bundle only ever uses `all .2s`, `all .3s` and
`background-color .1s, color .1s`, with Webflow's default `ease`. Hence
`--dur: 200ms`, `--dur-slow: 300ms`, `--ease: ease`. The previous
`cubic-bezier(.4,0,.2,1)` was not from the original.

---

## Buttons

Recorded here because step 3 needs them and they are pure token composition:

| Variant                | Fill        | Border         | Text       | Padding         | Radius | Weight |
| ---------------------- | ----------- | -------------- | ---------- | --------------- | ------ | ------ |
| `.button`              | fuchsia800  | 1px fuchsia800 | white      | `.75rem 1.5rem` | `1rem` | —      |
| `.button.is-secondary` | transparent | 1px fuchsia800 | fuchsia800 | `.75rem 1.5rem` | `1rem` | 700    |
| `.button.is-small`     | white       | —              | fuchsia800 | `.5rem 1.25rem` | `1rem` | 700    |
| `.button.is-link`      | transparent | none           | fuchsia800 | `.25rem 0`      | —      | 600    |

`.is-alternate` flips a variant for dark backgrounds (white border/text).
`.button-group` is `display: flex; gap: 1rem; flex-wrap: wrap`.

The header's Support button is `.button.is-small` — white pill, fuchsia text.

---

## Section heads — and the one that is not centred

Measured 03.09.2026. Section heads on the original sit inside
`section_about1-header`: a `.text-align-center` wrapper holding an accent
heading and a gray500 lead. `.text-align-center` is simply
`{ text-align: center }`. That is the house rule, and `Section`'s default.

There are exactly two exceptions, both real:

| Where                   | Selector                                  | Treatment                         |
| ----------------------- | ----------------------------------------- | --------------------------------- |
| `/games` "Total Battle" | `.heading-style-h3.text-color-fuchsia800` | accent, h3 step, **left-aligned** |
| `/company` open-source  | `.heading-style-h6.text-color-gray500`    | **muted**, h6 step, centred       |

**Do not "fix" the Total Battle heading to centred.** It is left-aligned on the
original because it is not a section head at all: it sits in
`product-header6` → `product-header6_content-right` →
`product-header6_content-inner-wrapper`, the copy column of a two-column
product-header grid whose other column holds the game art. There is no
`text-align-center` anywhere in its ancestry. Centring it would break the grid's
reading order and diverge from the original. It is `align="start" size="h3"` in
`Section` for this reason.

The open-source heading is the mirror-image trap: it is centred like the others
but is **not** accent-coloured and is far smaller — 1.25rem against 3rem. Making
it accent at h2 would be equally wrong.

Slot content is left-aligned everywhere except the contacts intro, where the
original centres the body copy along with the heading — `contentAlign="center"`,
opt-in per section.

### Also do not "fix": the /games store buttons are centred

On `/games`, the "Play now for free:" label and the row of store buttons are
**centred inside the copy column**, while the heading and body paragraphs
directly above them are left-aligned. That is not our mistake and not a
leftover: `.field-label` carries `.text-align-center`, and
`.variant-button-row` is `justify-content: center`. It looks like an
inconsistency in the original, and reproducing it is the point of a parity
build — it is not ours to correct.

### An inconsistency in the original we reproduce: two App Store URLs

The original links the iOS app at two different URLs depending on the page:

| Page               | URL                                                                    |
| ------------------ | ---------------------------------------------------------------------- |
| `/games` store row | `https://apps.apple.com/us/app/total-battle/id1274132545?l=en`         |
| footer, every page | `https://apps.apple.com/us/app/total-battle-war-strategy/id1274132545` |

Same app id, different slug, and only one carries `?l=en`. Both are reproduced
as they are rather than harmonised to whichever looks tidier. Do not
"deduplicate" them into one constant without deciding which the site should
actually use — that is a content decision, not a refactor.

## Open questions

1. ~~**Inter is not loaded by this project.**~~ **Resolved 03.09.2026.** Inter
   is now self-hosted via `@fontsource-variable/inter`, imported once in
   `BaseLayout.astro`. Self-hosting rather than Google Fonts is deliberate: the
   woff2 files are served from our own origin, so the CSP in `public/_headers`
   keeps `default-src 'self'` with no `font-src` exception.

   The package declares the family as **"Inter Variable"**, not "Inter", so
   that name leads `--font-body`. It ships a variable weight axis of `100 900`
   with `font-display: swap`, which covers the original's 300–700 range and
   also makes `.text-weight-xbold` (800) genuinely available rather than
   synthesised — the one place we can do better than the original.

2. **`--s-3` (0.75rem)** has no equivalent in the original's base scale — it is
   only the ≤767px step of `.margin-xsmall`. Ten component declarations use it,
   so it stays literal for now and should be retired during step 3.

3. **`--s-10` changed from 8rem to 7rem** to land on the real `xhuge` step;
   `10rem` (`xxhuge`) is available as `--space-xxhuge`.
