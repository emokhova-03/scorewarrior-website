/**
 * ДЕМО: выбор версии анимации меню. Лежит в public/ по той же причине, что
 * и nav.js: CSP разрешает только внешние скрипты с нашего домена.
 *
 * Часть 1 выполняется сразу (скрипт стоит в <head>), чтобы нужная версия
 * была выставлена до первой отрисовки и страница не мигала. Часть 2 ждёт,
 * пока разберётся DOM, и подключает кнопки.
 */
const root = document.documentElement;
const KEY = "sw-menu-version";
const DEMO_KEY = "sw-demo";

function read(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key, value) {
  try { localStorage.setItem(key, value); } catch { /* приватный режим — ок */ }
}

// ?demo=off / ?demo=on включает и выключает панель
const param = new URLSearchParams(location.search).get("demo");
if (param === "off" || param === "on") write(DEMO_KEY, param);

if (read(DEMO_KEY) !== "off") root.setAttribute("data-demo", "");
root.setAttribute("data-menu", read(KEY) || "v1");

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".demo-panel button");

  function mark() {
    const current = root.getAttribute("data-menu");
    buttons.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.version === current)),
    );
  }

  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      root.setAttribute("data-menu", b.dataset.version);
      write(KEY, b.dataset.version);
      mark();
    }),
  );
  mark();
});
