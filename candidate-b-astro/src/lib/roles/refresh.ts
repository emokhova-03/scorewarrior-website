import { parseRoles } from "./schema";

import { SNAPSHOT_KEY, type RolesSnapshot } from "./snapshot";

export interface RefreshResult {
  ok: boolean;
  roles: number;
  skipped: number;
  reason?: string;
}

/**
 * Fetches roles from the external source, validates them,
 * and stores a fresh snapshot in KV.
 *
 * The environment is passed as an argument instead of importing it
 * from "cloudflare:workers". This keeps the function usable both
 * from the Worker and from tests with mocked bindings.
 */
export async function refreshRolesSnapshot(env: Env): Promise<RefreshResult> {
  const sourceUrl = env.ROLES_SOURCE_URL;

  let response: Response;

  try {
    response = await fetch(sourceUrl, {
      headers: { accept: "application/json" },

      // Without a timeout, an unresponsive source could keep
      // the scheduled Worker running until the platform limit.
      signal: AbortSignal.timeout(5000),
    });
  } catch (cause) {
    return {
      ok: false,
      roles: 0,
      skipped: 0,
      reason: `source unavailable: ${cause}`,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      roles: 0,
      skipped: 0,
      reason: `source returned HTTP ${response.status}`,
    };
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    return {
      ok: false,
      roles: 0,
      skipped: 0,
      reason: "source returned invalid JSON",
    };
  }

  const parsed = parseRoles(payload);

  if (!parsed.ok) {
    return {
      ok: false,
      roles: 0,
      skipped: 0,
      reason: parsed.problem,
    };
  }

  // An empty response does not overwrite a known-good snapshot.
  //
  // Zero open roles can be a legitimate business state, but it can also
  // indicate an upstream failure such as a broken ATS deployment,
  // incorrect source URL, or authentication problem.
  //
  // The cost of these failures is asymmetric: temporarily serving
  // the previous snapshot is safer than accidentally clearing Careers
  // because an external source failed.
  if (parsed.roles.length === 0) {
    return {
      ok: false,
      roles: 0,
      skipped: parsed.problems.length,
      reason: "source returned zero roles; snapshot was not overwritten",
    };
  }

  const snapshot: RolesSnapshot = {
    roles: parsed.roles,
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    skipped: parsed.problems.length,
  };

  await env.ROLES_KV.put(SNAPSHOT_KEY, JSON.stringify(snapshot));

  return {
    ok: true,
    roles: parsed.roles.length,
    skipped: parsed.problems.length,
  };
}
