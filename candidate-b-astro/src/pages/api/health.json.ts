import type { APIRoute } from "astro";

import { BUILD_SHA, ROLES_MAX_AGE_MINUTES } from "astro:env/server";

import { readRolesSnapshot } from "../../lib/roles/read";
import { feedAgeSeconds } from "../../lib/roles/snapshot";

export const prerender = false;

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

export const GET: APIRoute = async () => {
  const { snapshot, source, problem } = await readRolesSnapshot();

  const ageSeconds = feedAgeSeconds(snapshot);
  const maxAgeSeconds = ROLES_MAX_AGE_MINUTES * 60;

  const checks: Check[] = [
    {
      name: "roles-snapshot-source",
      ok: source === "kv",
      detail: source === "kv" ? "из KV" : `запасной снимок: ${problem}`,
    },
    {
      name: "roles-feed-age",
      ok: ageSeconds <= maxAgeSeconds,
      detail: `${ageSeconds} с при пороге ${maxAgeSeconds} с`,
    },
    {
      name: "roles-not-empty",
      ok: snapshot.roles.length > 0,
      detail: `вакансий: ${snapshot.roles.length}`,
    },
    {
      name: "roles-nothing-skipped",
      ok: snapshot.skipped === 0,
      detail: `выброшено схемой: ${snapshot.skipped}`,
    },
  ];

  const healthy = checks.every((check) => check.ok);

  return Response.json(
    {
      status: healthy ? "ok" : "degraded",
      buildSha: BUILD_SHA,
      rolesSourceUrl: snapshot.sourceUrl,
      checks,
    },
    {
      // 503 — чтобы внешний монитор увидел проблему по коду ответа,
      // не разбирая тело. Мониторинг должен работать без парсера.
      status: healthy ? 200 : 503,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
};
