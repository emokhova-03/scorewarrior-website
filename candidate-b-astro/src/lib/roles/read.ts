import { env } from "cloudflare:workers";

import { parseRoles } from "./schema";
import { SNAPSHOT_KEY, snapshotSchema, type RolesSnapshot } from "./snapshot";

// This is the same file used during the build.
// Vite turns the JSON import into a regular object
// and bundles it with the Worker.
import bundledRoles from "../../../data/roles.json";

export type SnapshotSource = "kv" | "bundled";

export interface SnapshotRead {
  snapshot: RolesSnapshot;
  source: SnapshotSource;
  problem?: string;
}

/**
 * Snapshot bundled with the application build.
 * Used when KV is not available or does not contain a valid snapshot.
 */
function bundledSnapshot(problem: string): SnapshotRead {
  const parsed = parseRoles(bundledRoles);

  return {
    snapshot: {
      roles: parsed.ok ? parsed.roles : [],

      // The Unix epoch intentionally marks the bundled snapshot as stale.
      // /api/health.json must be able to detect that it is not fresh.
      // Using Date.now() here would incorrectly report fallback data
      // as freshly fetched data.
      fetchedAt: new Date(0).toISOString(),

      sourceUrl: "bundled://data/roles.json",
      skipped: parsed.ok ? parsed.problems.length : 0,
    },

    source: "bundled",
    problem,
  };
}

export async function readRolesSnapshot(): Promise<SnapshotRead> {
  let raw: unknown;

  try {
    raw = await env.ROLES_KV.get(SNAPSHOT_KEY, "json");
  } catch (cause) {
    return bundledSnapshot(`KV unavailable: ${cause}`);
  }

  if (raw === null) {
    // Cold start: the scheduled refresh has not written
    // a snapshot to the namespace yet.
    return bundledSnapshot("no snapshot in KV yet");
  }

  const parsed = snapshotSchema.safeParse(raw);

  if (!parsed.success) {
    return bundledSnapshot("KV snapshot failed schema validation");
  }

  return {
    snapshot: parsed.data,
    source: "kv",
  };
}
