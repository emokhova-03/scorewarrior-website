import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { TURNSTILE_SECRET } from "astro:env/server";

import {
  applicationSchema,
  fieldErrors,
} from "../../lib/apply/schema";

import { readRolesSnapshot } from "../../lib/roles/read";

export const prerender = false;

const RATE_LIMIT_PER_HOUR = 5;
const APPLICATION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Responds to both humans (redirect) and machines (JSON),
 * depending on the Accept header.
 */
function respond(
  request: Request,
  status: number,
  body: {
    ok: boolean;
    errors?: Record<string, string>;
    message?: string;
  },
  redirectTo?: string,
): Response {
  const wantsJson = request.headers
    .get("accept")
    ?.includes("application/json");

  if (wantsJson || !redirectTo) {
    return Response.json(body, {
      status,
      headers: {
        "cache-control": "no-store",
      },
    });
  }

  // 303 is required after POST:
  // the browser follows the redirect with GET,
  // so refreshing the page does not submit the form again.
  return new Response(null, {
    status: 303,
    headers: {
      location: redirectTo,
    },
  });
}

async function verifyTurnstile(
  token: string,
  ip: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",

        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: token,
          remoteip: ip,
        }),

        signal: AbortSignal.timeout(5000),
      },
    );

    const outcome = (await response.json()) as {
      success?: boolean;
    };

    return outcome.success === true;
  } catch {
    // Turnstile is unavailable.
    // Allow the application through: losing a candidate is worse
    // than accepting a single spam submission.
    // This is an intentional decision, so record it in the logs.
    console.log(
      JSON.stringify({
        event: "apply.turnstile_unavailable",
      }),
    );

    return true;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const ip =
    request.headers.get("cf-connecting-ip") ?? "unknown";

  // 1. Is this actually a form submission?
  const contentType =
    request.headers.get("content-type") ?? "";

  if (!contentType.includes("form")) {
    return respond(request, 415, {
      ok: false,
      message: "Expected a form submission",
    });
  }

  const form = await request.formData();

  const fields = Object.fromEntries(
    form,
  ) as Record<string, string>;

  const backTo = `/careers/${fields.roleSlug ?? ""}`;

  // 2. Honeypot for bots:
  // this field is hidden from human users.
  if (fields.company) {
    console.log(
      JSON.stringify({
        event: "apply.honeypot",
        ip,
      }),
    );

    return respond(
      request,
      200,
      { ok: true },
      `${backTo}?applied=1#apply`,
    );
  }

  // 3. Rate limit
  const rateKey = `ratelimit:apply:${ip}`;

  const sent = Number(
    (await env.ROLES_KV.get(rateKey)) ?? 0,
  );

  if (sent >= RATE_LIMIT_PER_HOUR) {
    return respond(
      request,
      429,
      {
        ok: false,
        message:
          "Too many applications from this address. Try again in an hour.",
      },
      `${backTo}?error=rate#apply`,
    );
  }

  // 4. Validate the submitted fields with Zod
  const parsed = applicationSchema.safeParse(fields);

  if (!parsed.success) {
    return respond(
      request,
      422,
      {
        ok: false,
        errors: fieldErrors(parsed.error),
      },
      `${backTo}?error=invalid#apply`,
    );
  }

  const application = parsed.data;

  // 5. Verify that the role still exists.
  // A candidate cannot normally change this through the form,
  // but a custom request made with curl could.
  const { snapshot } = await readRolesSnapshot();

  const role = snapshot.roles.find(
    (item) => item.slug === application.roleSlug,
  );

  if (!role) {
    return respond(
      request,
      422,
      {
        ok: false,
        errors: {
          roleSlug: "This role is no longer open",
        },
      },
      "/careers?error=closed",
    );
  }

  // 6. Verify Turnstile
  const token =
    fields["cf-turnstile-response"] ?? "";

  if (!(await verifyTurnstile(token, ip))) {
    return respond(
      request,
      403,
      {
        ok: false,
        message:
          "Could not verify that you are human. Please try again.",
      },
      `${backTo}?error=human#apply`,
    );
  }

  // 7. Store the application
  const id = crypto.randomUUID();

  await env.ROLES_KV.put(
    `application:${id}`,
    JSON.stringify({
      id,
      ...application,
      roleTitle: role.title,
      receivedAt: new Date().toISOString(),
      ip,
      userAgent:
        request.headers.get("user-agent") ?? "",
    }),
    {
      expirationTtl: APPLICATION_TTL_SECONDS,
    },
  );

  await env.ROLES_KV.put(
    rateKey,
    String(sent + 1),
    {
      expirationTtl: 3600,
    },
  );

  console.log(
    JSON.stringify({
      event: "apply.received",
      id,
      role: application.roleSlug,
    }),
  );

  return respond(
    request,
    201,
    {
      ok: true,
      message: "Thanks — we will be in touch.",
    },
    `${backTo}?applied=1#apply`,
  );
};

// A GET request to this endpoint is almost certainly a mistake.
// Return a clear response instead of a generic error.
export const GET: APIRoute = () =>
  Response.json(
    {
      ok: false,
      message: "POST a form to this endpoint",
    },
    {
      status: 405,
    },
  );