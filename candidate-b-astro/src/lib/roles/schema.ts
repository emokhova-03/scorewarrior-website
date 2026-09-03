import { z } from "astro/zod";

/**
 * The schema is the single source of truth for the role shape in this project.
 *
 * The `Role` type is inferred from the schema via z.infer rather than
 * declared manually. This means the schema and the type cannot drift apart:
 * when the schema changes, the type changes automatically, and TypeScript
 * immediately points out every place that no longer matches.
 *
 * This follows PRD §6:
 * "static types derived from schemas, never hand-duplicated".
 */
export const roleSchema = z.object({
  // The slug becomes part of the URL (/careers/<slug>) and serves as
  // the record ID in the collection, so its format is validated strictly
  // rather than merely checking that it is a non-empty string.
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'slug: only lowercase letters, numbers, and hyphens are allowed, for example "backend-engineer"',
    ),

  // .trim() is a transformation and runs BEFORE .min(1).
  // The order matters: "   " becomes "" after trim, so min(1) rejects it.
  title: z.string().trim().min(1, "title is required"),
  department: z.string().trim().min(1, "department is required"),
  location: z.string().trim().min(1, "location is required"),

  postedAt: z.iso.date().optional(),

  /**
   * Whether the role is remote. Defaults to false because on-site is the
   * house rule — one role in the source list is the exception.
   *
   * This exists so no page has to infer it from the location string. A page
   * that hardcodes "on-site" while the data says otherwise is a page telling
   * a candidate something untrue about a job they might apply for.
   */
  remote: z.boolean().default(false),

  /**
   * "FullTime" is the only value the source uses. Kept in the source's own
   * spelling rather than schema.org's FULL_TIME; the JSON-LD on the role page
   * maps it, since that mapping belongs to the consumer, not the data.
   */
  employmentType: z.literal("FullTime").default("FullTime"),

  /**
   * Long-form content. Deliberately optional and, for now, unset.
   *
   * The imported titles come from the public job board; the prose for each
   * role lives behind its client-rendered detail page, which we did not
   * scrape. Writing 25 job descriptions ourselves would be fabrication at
   * scale, and a candidate cannot tell invented responsibilities from real
   * ones. The role page renders a marked placeholder instead. See
   * docs/backlog.md — these come from the ATS.
   */
  description: z.string().trim().min(1).optional(),
  responsibilities: z.array(z.string().trim().min(1)).optional(),
  requirements: z.array(z.string().trim().min(1)).optional(),
});

export type Role = z.infer<typeof roleSchema>;

/**
 * Result of parsing the roles source.
 *
 * This is a discriminated union: the `ok` field is the discriminator
 * that allows TypeScript to determine which other fields are available.
 * Inside an `if (!parsed.ok)` branch, TypeScript knows that `problem`
 * exists while `roles` does not, preventing accidental access to `roles`.
 *
 * The two variants represent two different classes of failure:
 *  - ok: false — the source as a whole is unusable (it is not an array).
 *                Parsing cannot continue.
 *  - ok: true  — the source is usable, but individual records may have
 *                failed validation. They are listed in `problems` and
 *                are not included in `roles`.
 */
export type RolesParse =
  | { ok: false; problem: string }
  | { ok: true; roles: Role[]; problems: string[] };

/**
 * Converts Zod issues into a single readable string.
 *
 * Zod returns an array of objects containing a path and a message,
 * while the build log needs readable text rather than a structure dump.
 */
function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

/**
 * Parses data received from the roles source.
 *
 * This is a pure function: it accepts already-loaded data, does not read
 * from the file system, and does not make network requests. This makes it
 * possible to test without a file system. It also means the validation logic
 * does not need to change when the transport changes from a file to KV.
 *
 * The transport changes; the validation rules remain the same.
 *
 * @param input Any value: the result of JSON.parse, an HTTP response body,
 * or a value read from KV.
 */
export function parseRoles(input: unknown): RolesParse {
  if (!Array.isArray(input)) {
    return {
      ok: false,
      problem: "Expected a JSON array of roles",
    };
  }

  const roles: Role[] = [];
  const problems: string[] = [];

  // A Set is used because the slug becomes part of the URL.
  // Two roles with the same slug would cause either a lost page
  // or a route conflict. Earlier manual validators did not catch
  // this class of error.
  const seenSlugs = new Set<string>();

  input.forEach((item, index) => {
    // safeParse does not throw an exception; it returns a validation result.
    // This allows one invalid record to be skipped while parsing continues,
    // instead of failing the entire source on the first invalid record.
    const result = roleSchema.safeParse(item);

    if (!result.success) {
      problems.push(`record #${index}: ${formatIssues(result.error)}`);
      return;
    }

    const role = result.data;

    if (seenSlugs.has(role.slug)) {
      problems.push(
        `record #${index}: slug "${role.slug}" has already been used — slugs become part of the URL and must be unique`,
      );
      return;
    }

    seenSlugs.add(role.slug);
    roles.push(role);
  });

  return { ok: true, roles, problems };
}
