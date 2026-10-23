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
  // ВАЖНО: класс вешаем синхронно, ДО пересчёта стилей (браузер сообщает о
  // смене media query перед style recalc). Иначе transition'ы мобильного меню
  // успевают стартовать и панель «дёргается» (улетает/мигает) при переходе.
  suppressTransitions();
  if (!event.matches && isOpen()) setOpen(false);
  playSwitch();
});

/**
 * На время переключения режима отключаем ВСЕ transition внутри шапки
 * (CSS: .is-resizing в siteHeader.astro). Снимаем через два кадра — когда
 * новые стили уже применены, и дальше меню анимируется как обычно.
 */
let resizeFrames = 0;
function suppressTransitions() {
  header?.classList.add("is-resizing");
  cancelAnimationFrame(resizeFrames);
  resizeFrames = requestAnimationFrame(() => {
    resizeFrames = requestAnimationFrame(() => {
      header?.classList.remove("is-resizing");
    });
  });
}

/**
 * Плавная смена режима: на ~0.5 с вешаем .is-switching на шапку, CSS в
 * siteHeader.astro проявляет элементы нового режима. Класс сначала снимаем и
 * форсируем reflow (offsetWidth), чтобы анимация перезапускалась и при
 * быстром «туда-сюда» ресайзе.
 */
const header = document.querySelector(".site-header");
let switchTimer;

function playSwitch() {
  if (!header) return;
  header.classList.remove("is-switching");
  void header.offsetWidth;
  header.classList.add("is-switching");
  clearTimeout(switchTimer);
  switchTimer = setTimeout(() => header.classList.remove("is-switching"), 600);
}

/**
 * «Плавающая пилюля» под пунктами десктопного меню.
 *
 * Приёмы из курса (Radix NavigationMenu, App.css):
 *  - ОДНА общая поверхность, которая меняет положение и размер (как
 *    .viewport с transition по width/height), а не по подсветке на пункт;
 *  - первое появление — лёгкий scale 0.96→1 + fade (как scaleIn 0.98);
 *  - между пунктами пилюля едет, а не мигает;
 *  - «grace period» при уходе курсора (~120 мс): курсор пересекает зазор
 *    между пунктами, не выходя за меню, — без задержки пилюля гасла бы и
 *    включалась снова (hover flicker).
 * Клавиатуру не трогаем: по курсу действия с клавиатуры не анимируют.
 */
const pill = document.querySelector(".nav-pill");
const navList = document.querySelector(".nav-list");
const pillLinks = document.querySelectorAll(".nav-list a");
let hideTimer;

function placePill(link) {
  const n = nav.getBoundingClientRect();
  const r = link.getBoundingClientRect();
  pill.style.width = `${r.width}px`;
  pill.style.height = `${r.height}px`;
  // Отдельное свойство translate (не transform): scale живёт в своём
  // свойстве и не конфликтует с позицией.
  pill.style.translate = `${r.left - n.left}px ${r.top - n.top}px`;
}

function showPill(link) {
  clearTimeout(hideTimer);
  if (!pill.classList.contains("is-on")) {
    pill.classList.add("no-move"); // возникает на месте, не летит из угла
    placePill(link);
    void pill.offsetWidth; // фиксируем позицию до включения transition
    pill.classList.remove("no-move");
    pill.classList.add("is-on");
  } else {
    placePill(link);
  }
}

if (pill && navList) {
  pillLinks.forEach((link) => {
    link.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse" || collapsed.matches) return;
      showPill(link);
    });
  });

  navList.addEventListener("pointerleave", () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => pill.classList.remove("is-on"), 120);
  });
}

// Клик по затемнению (вариант «Dim») закрывает меню.
document.querySelector(".nav-scrim")?.addEventListener("click", () => {
  if (isOpen()) {
    setOpen(false);
    burger.focus();
  }
});
