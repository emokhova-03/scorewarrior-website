/**
 * Slider controls for the Gallery section.
 *
 * In public/ as a real file for the same reason as nav.js: Astro inlines small
 * component scripts, and `script-src 'self'` in public/_headers blocks inline
 * scripts while allowing external ones from our origin. See docs/backlog.md.
 *
 * The track itself scrolls and snaps in CSS, so this only has to move it by
 * one slide. Everything stays usable without this file — the track is
 * scrollable and keyboard-focusable on its own; the buttons are the
 * enhancement.
 */

document.querySelectorAll("[data-gallery]").forEach((root) => {
  // Astro emits one <script is:inline src> per component instance, so two
  // galleries on a page would load this twice and bind every button twice.
  // Marking each root keeps it bound once regardless.
  if (root.dataset.galleryReady) return;
  root.dataset.galleryReady = "true";

  const track = root.querySelector(".track");

  if (!track) return;

  /**
   * One slide plus one gap, measured live rather than cached: the slide width
   * is a viewport-relative clamp, so it changes on resize and on zoom.
   */
  const step = () => {
    const slide = track.querySelector(".slide");

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;

    const width = slide?.getBoundingClientRect().width ?? track.clientWidth;

    return width + gap;
  };

  root.querySelectorAll("[data-dir]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = Number(btn.dataset.dir);

      // Read the preference per click, not once at load: a visitor can change
      // it mid-session, and on iOS toggling Reduce Motion does not reload the
      // page. The CSS rule in global.css cannot reach this, because `behavior`
      // is a script argument rather than a style.
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      track.scrollBy({
        left: dir * step(),
        behavior: reduced ? "auto" : "smooth",
      });
    });
  });
});
