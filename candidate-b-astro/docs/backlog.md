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

## Later

- Dark theme — post-demo idea only. The original scorewarrior.com has a single
  light theme and no toggle, and neither does this project: what looked like a
  theme switch during review was Astro's dev error overlay. If it is ever
  wanted it is new design work, not parity work, so it needs its own palette
  measured from somewhere other than the original.
- `src/node_modules/.vite` keeps reappearing inside `src/` — find what creates
  it.
- Reference screenshots are local-only; downsample and commit them if the
  parity work continues past the demo.
- Component scripts are external files because the CSP forbids inline scripts;
  revisit if we ever adopt nonce-based CSP, which needs every page
  server-rendered.
- Retire `--s-3` (0.75rem). It has no equivalent in the original's base spacing
  scale — it is only the ≤767px step of `.margin-xsmall`. Ten component
  declarations still use it.
