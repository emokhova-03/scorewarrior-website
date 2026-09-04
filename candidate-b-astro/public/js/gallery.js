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

  /**
   * Read the preference per call, not once at load: a visitor can change it
   * mid-session, and on iOS toggling Reduce Motion does not reload the page.
   * The CSS rule in global.css cannot reach this, because `behavior` is a
   * script argument rather than a style.
   */
  const behavior = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  root.querySelectorAll("[data-dir]").forEach((btn) => {
    btn.addEventListener("click", () => {
      track.scrollBy({
        left: Number(btn.dataset.dir) * step(),
        behavior: behavior(),
      });
    });
  });

  // ---- slide dots -------------------------------------------------------
  //
  // The markup is rendered by Gallery.astro, so the count is right even if
  // this file never loads. What is added here is the two things that need
  // script: jumping to a slide, and knowing which slide you are on.

  const dots = [...root.querySelectorAll("[data-gallery-dots] button")];
  const slides = [...track.querySelectorAll(".slide")];

  // Bail rather than half-work if the two lists ever drift apart — a mismatch
  // means the markup changed and the mapping below would be wrong.
  if (dots.length === 0 || dots.length !== slides.length) return;

  /**
   * Offset of a slide within the track's scroll range.
   *
   * Measured as a difference from the first slide rather than read straight
   * off offsetLeft: offsetLeft is relative to the nearest positioned
   * ancestor, which is not necessarily the track, but the difference between
   * two of them is the scroll distance either way.
   */
  const offsetOf = (index) => slides[index].offsetLeft - slides[0].offsetLeft;

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      track.scrollTo({ left: offsetOf(index), behavior: behavior() });
    });
  });

  /**
   * Mark the slide nearest the track's left edge as current.
   *
   * Nearest-wins rather than an IntersectionObserver: /company shows three
   * slides at once, so several are always intersecting and "is it visible"
   * cannot name a single current slide. Distance to the snap position can.
   *
   * aria-current is the only state written — the stylesheet selects on it, so
   * there is no second class to keep in sync.
   */
  const sync = () => {
    let nearest = 0;

    slides.forEach((_, index) => {
      const distance = Math.abs(offsetOf(index) - track.scrollLeft);
      if (distance < Math.abs(offsetOf(nearest) - track.scrollLeft)) {
        nearest = index;
      }
    });

    dots.forEach((dot, index) => {
      dot.setAttribute("aria-current", index === nearest ? "true" : "false");
    });
  };

  // Scroll fires far more often than the screen repaints, and each sync reads
  // layout. One run per frame is enough and keeps the handler cheap.
  let queued = false;

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sync();
    });
  };

  track.addEventListener("scroll", onScroll, { passive: true });

  // Slide width is viewport-relative, so a resize moves every snap position.
  window.addEventListener("resize", onScroll, { passive: true });

  sync();
});
