import { defineConfig } from "vitest/config";

/**
 * Конфиг НЕ использует getViteConfig() из astro/config намеренно.
 * getViteConfig подтягивает весь astro.config.mjs вместе с адаптером,
 * а @cloudflare/vite-plugin падает на resolve.external, который Astro
 * выставляет для ssr-окружения (список node-билтинов).
 *
 * Здесь тестируются только чистые модули из src/lib (astro/zod
 * резолвится обычным Vite), поэтому конфиг Astro тут не нужен вовсе.
 * Если появятся тесты, которым нужны virtual-модули Astro
 * (astro:content, astro:env), их стоит вынести в отдельный проект
 * с getViteConfig и без адаптера.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
