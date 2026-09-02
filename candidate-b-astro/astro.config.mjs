// @ts-check

import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://scorewarrior-website.emokhova.workers.dev/",

  // Остаётся "static". Это НЕ значит "без сервера": это значит
  // "по умолчанию страница статическая, а исключения помечаются
  // вручную через export const prerender = false".
  output: "static",

  adapter: cloudflare({
    // Оптимизировать картинки на сборке, как раньше.
    // По умолчанию адаптер v13+ использует Images-биндинг Cloudflare,
    // то есть обработку на запросе. Нам это не нужно: арты не меняются,
    // а платить за обработку каждого просмотра незачем.
    imageService: "compile",
  }),

  env: {
    schema: {
      // Откуда cron берёт вакансии. В проде это был бы адрес ATS;
      // сегодня — raw-файл из этого же репозитория.
      ROLES_SOURCE_URL: envField.string({
        context: "server",
        access: "public",
        url: true,
      }),

      // Допустимый возраст снимка вакансий. Из F2.AC2: 15 минут.
      ROLES_MAX_AGE_MINUTES: envField.number({
        context: "server",
        access: "public",
        int: true,
        min: 1,
        default: 15,
      }),

      // SHA сборки — для /api/health.json и проверки дрейфа (PRD §8).
      BUILD_SHA: envField.string({
        context: "server",
        access: "public",
        default: "local",
      }),
    },

    // Проверять секреты на сборке, а не в проде. Секретов пока нет,
    // первый появится в Части VI — и тогда эта строка начнёт работать.
    validateSecrets: true,
  },
});
