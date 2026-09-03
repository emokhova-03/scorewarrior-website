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

burger?.addEventListener("click", () => {
  const open = burger.getAttribute("aria-expanded") === "true";

  burger.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("is-open", !open);
});

// Escape closes the menu and hands focus back to the control that opened it.
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (burger?.getAttribute("aria-expanded") !== "true") return;

  burger.setAttribute("aria-expanded", "false");
  nav?.classList.remove("is-open");
  burger.focus();
});
