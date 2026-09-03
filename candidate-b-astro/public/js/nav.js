/**
 * Mobile navigation toggle for the site header.
 *
 * This lives in public/ as a real file rather than in a <script> block in
 * siteHeader.astro on purpose. Astro compiles small component scripts inline
 * into the HTML, and the CSP in public/_headers is `script-src 'self'`, which
 * allows externally referenced scripts from our origin but not inline ones.
 * An inline block is therefore silently blocked in production while working
 * fine in dev, where _headers is not applied.
 *
 * Served from our own origin, so the policy needs no 'unsafe-inline' and no
 * per-build hash. Loaded with defer, so the DOM is parsed before this runs.
 */

const burger = document.querySelector(".burger");
const nav = document.getElementById("site-nav");

/** Matches the width at which the header collapses — .navbar14 uses 991px. */
const collapsed = window.matchMedia("(max-width: 991px)");

function setOpen(open) {
  burger?.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("is-open", open);

  // Stops the page behind the panel from scrolling. The panel scrolls on its
  // own (max-height + overflow-y in the component's styles), and
  // overscroll-behavior keeps that scroll from chaining through to the body.
  document.body.classList.toggle("nav-open", open);
}

function isOpen() {
  return burger?.getAttribute("aria-expanded") === "true";
}

burger?.addEventListener("click", () => {
  setOpen(!isOpen());
});

// Escape closes the menu and hands focus back to the control that opened it.
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!isOpen()) return;

  setOpen(false);
  burger.focus();
});

/**
 * Growing past the collapse width turns the panel back into the desktop nav.
 * Without this the menu would still count as open, and the body scroll lock
 * would stay on with no visible control to release it.
 */
collapsed.addEventListener("change", (event) => {
  if (!event.matches && isOpen()) setOpen(false);
});
