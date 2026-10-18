/**
 * Contact form provider adapter (00-overview §5.2, 03-integrations-spec §3.3).
 *
 * The only file that knows which form service is in use (Web3Forms today).
 * Swapping vendor means rewriting the body of `submitContact`, nothing else.
 *
 * Config is read from `NEXT_PUBLIC_CONTACT_ENDPOINT` and
 * `NEXT_PUBLIC_CONTACT_ACCESS_KEY`. Both are inlined into the browser bundle
 * at build time and are PUBLIC BY DESIGN: never put a real secret in a
 * `NEXT_PUBLIC_*` variable. When either is missing, `submitContact` returns a
 * `provider` error without touching the network, so a build without config
 * still renders the form's fallback state.
 *
 * Rules this file keeps: never throws, one `fetch` at most, no retries (a
 * retry can deliver the same email twice), no logging of input or key, no
 * provider text ever reaches the caller (only the fixed keys below).
 */

export type ContactInput = {
  /** 1–100 characters. */
  name: string;
  /** Valid address, ≤ 254 characters. */
  email: string;
  /** Optional, ≤ 150 characters. */
  subject?: string;
  /** 10–5000 characters. */
  message: string;
  /** Honeypot field `botcheck`; must be "". */
  honeypot: string;
  /** Milliseconds since the form rendered; < 3000 is treated as a bot. */
  elapsedMs: number;
};

export type ContactErrorCode =
  | "validation"
  | "spam"
  | "rate_limited"
  | "network"
  | "provider";

export type ContactResult =
  | { ok: true }
  | { ok: false; code: ContactErrorCode; message: string };

/** Limits from 00 §5.2. Exported so the form can share them. */
export const CONTACT_LIMITS = {
  nameMax: 100,
  emailMax: 254,
  subjectMax: 150,
  messageMin: 10,
  messageMax: 5000,
  minElapsedMs: 3000,
  timeoutMs: 15000,
} as const;

/**
 * Every `message` value `submitContact` can return. They are copy IDs, not
 * copy: Frontend maps them (or just the `code`) to strings in
 * `docs/design/copy.md`.
 */
export const CONTACT_MESSAGE_KEYS = {
  nameInvalid: "contact.error.name.invalid",
  emailInvalid: "contact.error.email.invalid",
  subjectInvalid: "contact.error.subject.invalid",
  messageInvalid: "contact.error.message.invalid",
  validation: "contact.error.validation",
  spam: "contact.error.spam",
  rateLimited: "contact.error.rate_limited",
  network: "contact.error.network",
  provider: "contact.error.provider",
  notConfigured: "contact.error.not_configured",
} as const;

const DEFAULT_SUBJECT = "Message from sidwat.github.io";
const FROM_NAME = "sidwat.github.io";
const K = CONTACT_MESSAGE_KEYS;

type Config = { endpoint: string; accessKey: string };

function readConfig(): Config | null {
  // Literal `process.env.NEXT_PUBLIC_*` references so Next inlines them.
  const endpoint = (process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "").trim();
  const accessKey = (process.env.NEXT_PUBLIC_CONTACT_ACCESS_KEY ?? "").trim();
  if (!endpoint || !accessKey || !endpoint.startsWith("https://")) return null;
  return { endpoint, accessKey };
}

/** True when the build carries endpoint + key. Lets the UI show the fallback up front. */
export function isContactConfigured(): boolean {
  return readConfig() !== null;
}

function fail(code: ContactErrorCode, message: string): ContactResult {
  return { ok: false, code, message };
}

/** Strip control characters. Single-line fields also lose CR/LF (header injection). */
function clean(value: unknown, singleLine: boolean): string {
  const s = typeof value === "string" ? value : "";
  const stripped = singleLine
    ? s.replace(/[\u0000-\u001f\u007f]+/g, " ")
    : s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");
  return stripped.trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const URL_RE = /\bhttps?:\/\/|\bwww\./gi;

type Clean = { name: string; email: string; subject: string; message: string };

function validate(input: ContactInput): ContactResult | Clean {
  const name = clean(input.name, true);
  const email = clean(input.email, true);
  const subject = clean(input.subject, true);
  const message = clean(input.message, false);
  const L = CONTACT_LIMITS;

  if (name.length < 1 || name.length > L.nameMax) return fail("validation", K.nameInvalid);
  if (email.length > L.emailMax || !EMAIL_RE.test(email)) return fail("validation", K.emailInvalid);
  if (subject.length > L.subjectMax) return fail("validation", K.subjectInvalid);
  if (message.length < L.messageMin || message.length > L.messageMax) {
    return fail("validation", K.messageInvalid);
  }
  return { name, email, subject, message };
}

function looksLikeSpam(message: string): boolean {
  const urls = message.match(URL_RE)?.length ?? 0;
  return urls > 2 && message.length < 200;
}

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = JSON.parse(await res.text());
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Provider text is only *inspected* for classification, never returned. */
function providerText(body: Record<string, unknown> | null): string {
  if (!body) return "";
  const inner = body.body && typeof body.body === "object" ? (body.body as Record<string, unknown>) : null;
  const msg = body.message ?? inner?.message ?? body.error;
  return typeof msg === "string" ? msg : "";
}

function classify(status: number, body: Record<string, unknown> | null): ContactResult {
  const text = providerText(body);
  if (status >= 200 && status < 300 && body?.success === true) return { ok: true };
  if (status === 429 || /\b(quota|limit)\b/i.test(text)) return fail("rate_limited", K.rateLimited);
  // A bad or blocked access key is our fault, not the visitor's.
  if (/access.?key|not allowed|blocked/i.test(text)) return fail("provider", K.provider);
  if (status === 400 || status === 422) return fail("validation", K.validation);
  return fail("provider", K.provider);
}

/** Never throws. Makes at most one network request. */
export async function submitContact(input: ContactInput): Promise<ContactResult> {
  try {
    // Bot gates first, before anything else: silent and network-free.
    if (clean(input?.honeypot, false) !== "") return fail("spam", K.spam);
    const elapsed = Number(input?.elapsedMs);
    if (!Number.isFinite(elapsed) || elapsed < CONTACT_LIMITS.minElapsedMs) {
      return fail("spam", K.spam);
    }

    const v = validate(input);
    if ("ok" in v) return v;
    if (looksLikeSpam(v.message)) return fail("spam", K.spam);

    const config = readConfig();
    if (!config) return fail("provider", K.notConfigured);
    if (typeof fetch !== "function") return fail("network", K.network);

    const payload = {
      access_key: config.accessKey,
      name: v.name,
      email: v.email,
      subject: v.subject ? `${DEFAULT_SUBJECT}: ${v.subject}` : DEFAULT_SUBJECT,
      message: v.message,
      botcheck: "",
      from_name: FROM_NAME,
    };

    // One 15 s budget covers both the request and reading the body.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONTACT_LIMITS.timeoutMs);
    try {
      let res: Response;
      try {
        res = await fetch(config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
          credentials: "omit",
        });
      } catch {
        return fail("network", K.network);
      }
      const body = await readJson(res);
      if (controller.signal.aborted) return fail("network", K.network);
      return classify(res.status, body);
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return fail("provider", K.provider);
  }
}
