import type { APIRoute } from "astro";

import { env } from "cloudflare:workers";
import { BUILD_SHA } from "astro:env/server";

// Без этой строки страница была бы собрана заранее, и код исполнился бы
// один раз на сборке, а не на запросе. Это ровно то, что мы хотим отключить.
export const prerender = false;

export const GET: APIRoute = async () => {
  // Проба KV: намеренно читаем ключ, которого нет.
  // Нам важно не значение, а то, что биндинг вообще существует.
  const probe = await env.ROLES_KV.get("__ping__");

  return Response.json({
    ok: true,
    buildSha: BUILD_SHA,
    kvBindingWorks: probe === null,
    now: new Date().toISOString(),
  });
};
