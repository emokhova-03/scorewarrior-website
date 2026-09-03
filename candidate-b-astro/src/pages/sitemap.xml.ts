import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

// Note that there is no `prerender = false` here.
// The sitemap is generated at build time, so it should reflect
// the state of the site at the time of publication, not at request time.
//
// This also shows why the roles collection still exists:
// server-rendered pages cannot be enumerated at build time,
// but collection entries can.

const STATIC_PATHS = ["/", "/company", "/games", "/contacts", "/careers"];

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    // Return a clear error instead of generating URLs like "undefined/careers".
    throw new Error(
      "astro.config.mjs: the `site` field is required for sitemap.xml",
    );
  }

  const roles = await getCollection("roles");

  const paths = [
    ...STATIC_PATHS,
    ...roles.map((role) => `/careers/${role.id}`),
  ];

  const urls = paths
    .map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        "content-type": "application/xml; charset=utf-8",
      },
    },
  );
};
