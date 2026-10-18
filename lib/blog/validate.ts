// Front-matter validation for content/blog/*.md (contract: docs/00-overview.md §5.1).
// Every message names the file and the field, because it is what the owner reads
// in a failed GitHub Action.

import { z } from "zod";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TAG_PATTERN = SLUG_PATTERN;
export const TITLE_MAX = 90;
export const SUMMARY_MAX = 200;

/** A build-time error that is safe to show to a human as-is. */
export class BlogContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlogContentError";
  }
}

// ISO 8601 date-time with an explicit timezone, or a bare date (read as UTC midnight,
// which is also what YAML does with an unquoted bare date).
const ISO_DATE_TIME =
  /^\d{4}-\d{2}-\d{2}[Tt ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:[Zz]|[+-]\d{2}:?\d{2})$/;
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normalise a front-matter timestamp to an ISO string, or return undefined.
 * gray-matter (js-yaml) turns an unquoted timestamp into a `Date`; a quoted one
 * stays a string. Both are accepted.
 */
export function normaliseTimestamp(value: unknown): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }
  if (typeof value !== "string") return undefined;
  const s = value.trim();
  let ms: number;
  if (ISO_DATE_ONLY.test(s)) ms = Date.parse(`${s}T00:00:00Z`);
  else if (ISO_DATE_TIME.test(s)) ms = Date.parse(s.replace(" ", "T"));
  else return undefined;
  if (Number.isNaN(ms)) return undefined;
  // Reject impossible calendar dates (Date.parse rolls 2026-02-31 over to March).
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    return undefined;
  }
  return new Date(ms).toISOString();
}

const missing = (input: unknown) => input === undefined || input === null || input === "";

const requiredText = (max: number) =>
  z
    .string({
      error: (iss) => (missing(iss.input) ? "is required" : "must be text (wrap it in quotes)"),
    })
    .trim()
    .min(1, { error: "is required" })
    .max(max, { error: `must be at most ${max} characters` });

const timestamp = (required: boolean) =>
  z.unknown().optional().transform((value, ctx) => {
    if (missing(value)) {
      if (required) ctx.addIssue({ code: "custom", message: "is required" });
      return undefined;
    }
    const iso = normaliseTimestamp(value);
    if (iso === undefined) {
      ctx.addIssue({
        code: "custom",
        message: `is not a valid date (got ${JSON.stringify(String(value))}; use e.g. 2026-11-02T09:00:00Z)`,
      });
    }
    return iso;
  });

const frontMatterSchema = z
  .object({
    title: requiredText(TITLE_MAX),
    date: timestamp(true),
    updated: timestamp(false),
    summary: requiredText(SUMMARY_MAX),
    tags: z
      .array(
        z
          .string({ error: "must be a list of words, e.g. [video-coding, notes]" })
          .regex(TAG_PATTERN, {
            error: (iss) =>
              `must be lowercase-kebab-case (got ${JSON.stringify(iss.input)}, e.g. video-coding)`,
          }),
        { error: "must be a list, e.g. [video-coding, notes]" },
      )
      .nullish()
      .transform((tags) => tags ?? []),
    cover: z
      .string({ error: "must be an image path, e.g. /images/blog/<slug>/cover.jpg" })
      .trim()
      .nullish()
      .transform((v) => (v ? v : undefined)),
    coverAlt: z
      .string({ error: "must be text" })
      .trim()
      .nullish()
      .transform((v) => (v ? v : undefined)),
    draft: z.boolean({
      error: (iss) => (missing(iss.input) ? "is required (true or false)" : "must be true or false"),
    }),
  })
  .superRefine((fm, ctx) => {
    if (fm.cover && !fm.coverAlt) {
      ctx.addIssue({ code: "custom", path: ["coverAlt"], message: "is required when cover is set" });
    }
    if (fm.cover && !fm.cover.startsWith("/") && !/^https?:\/\//.test(fm.cover)) {
      ctx.addIssue({
        code: "custom",
        path: ["cover"],
        message: "must start with / (e.g. /images/blog/<slug>/cover.jpg) or be an https:// URL",
      });
    }
  });

export type FrontMatter = {
  title: string;
  date: string;
  updated?: string;
  summary: string;
  tags: string[];
  cover?: string;
  coverAlt?: string;
  draft: boolean;
};

/**
 * Validate parsed front matter. Throws a BlogContentError listing every problem,
 * one per line, as `content/blog/foo.md: "summary" is required`.
 */
export function validateFrontMatter(file: string, data: unknown): FrontMatter {
  const result = frontMatterSchema.safeParse(data ?? {});
  if (result.success) {
    const fm = result.data;
    return { ...fm, date: fm.date as string };
  }
  const lines = result.error.issues.map((issue) => {
    const field = issue.path.length ? String(issue.path[0]) : "front matter";
    const index = issue.path.length > 1 ? ` (item ${Number(issue.path[1]) + 1})` : "";
    return `${file}: "${field}"${index} ${issue.message}`;
  });
  throw new BlogContentError([...new Set(lines)].join("\n"));
}
