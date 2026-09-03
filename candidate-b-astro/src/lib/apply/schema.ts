import { z } from "astro/zod";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Application schema.
 * Error messages are written exactly as the candidate will see them:
 * they are part of the interface, not debugging output.
 */
export const applicationSchema = z.object({
  roleSlug: z.string().regex(SLUG, "Unknown role"),

  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(120),

  email: z
    .email("Enter a valid email address")
    .max(200),

  // The link is optional, but if provided, it must be a valid URL.
  // An empty string is what an unfilled form field sends,
  // so it is allowed explicitly instead of using .optional().
  link: z.union([
    z.url("Portfolio link must be a full URL, including https://"),
    z.literal(""),
  ]),

  message: z
    .string()
    .trim()
    .min(20, "Tell us a bit more — a couple of sentences is enough")
    .max(4000, "Please keep it under 4000 characters"),

  // A checked checkbox is submitted as the string "on".
  // If it is not checked, the field is omitted entirely.
  // z.literal validates the accepted checked value.
  consent: z.literal(
    "on",
    "Please confirm you agree to the privacy policy",
  ),
});

export type Application = z.infer<typeof applicationSchema>;

/**
 * Converts validation issues into:
 * "field name -> first error message".
 *
 * There is no need to show a candidate several validation
 * errors for the same field at once.
 */
export function fieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }

  return errors;
}