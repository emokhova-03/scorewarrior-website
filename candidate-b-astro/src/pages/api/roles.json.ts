import type { APIRoute } from "astro";

import { env, waitUntil } from "cloudflare:workers";
import { ROLES_MAX_AGE_MINUTES } from "astro:env/server";

import { readRolesSnapshot } from "../../lib/roles/read";
import { refreshRolesSnapshot } from "../../lib/roles/refresh";
import { feedAgeSeconds } from "../../lib/roles/snapshot";

export const prerender = false;

let refreshInProgress: Promise<void> | null = null;

function triggerBackgroundRefresh(): void {
  if (refreshInProgress !== null) {
    return;
  }

  refreshInProgress = refreshRolesSnapshot(env)
    .then((result) => {
      console.log(
        JSON.stringify({
          event: "roles.refresh.fallback",
          ...result,
        }),
      );
    })
    .catch((cause) => {
      console.error(
        JSON.stringify({
          event: "roles.refresh.fallback",
          ok: false,
          reason: String(cause),
        }),
      );
    })
    .finally(() => {
      refreshInProgress = null;
    });

  waitUntil(refreshInProgress);
}

export const GET: APIRoute = async () => {
  const { snapshot, source, problem } = await readRolesSnapshot();

  const ageSeconds = feedAgeSeconds(snapshot);
  const maxAgeSeconds = ROLES_MAX_AGE_MINUTES * 60;

  const needsRefresh = source === "bundled" || ageSeconds > maxAgeSeconds;

  if (needsRefresh) {
    triggerBackgroundRefresh();
  }

  return Response.json(
    {
      source,
      problem,
      fetchedAt: snapshot.fetchedAt,
      feedAgeSeconds: ageSeconds,
      skipped: snapshot.skipped,
      roles: snapshot.roles,
    },
    {
      headers: {
        // Cloudflare may cache the response for 60 seconds,
        // while the browser must revalidate it.
        //
        // Data freshness is managed by the scheduled refresh
        // and the runtime resilience fallback, not by the browser.
        "cache-control":
          "public, max-age=0, s-maxage=60, stale-while-revalidate=600",
      },
    },
  );
};
