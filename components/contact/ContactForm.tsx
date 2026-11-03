"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type RefObject,
} from "react";
import {
  CONTACT_LIMITS as L,
  isContactConfigured,
  submitContact,
  type ContactErrorCode,
  type ContactResult,
} from "@/lib/contact/provider";
import { site } from "@/lib/site";
import { t, type ContactCopyId } from "./copy";
import FieldError from "./FieldError";

// Behaviour: docs/02-frontend-spec.md F-3 and docs/design/contact.md.
// Never log what the visitor typed.

type FieldName = "name" | "email" | "subject" | "message";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, ContactCopyId>>;

type Status =
  | { kind: "unconfigured" }
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "success" }
  // A failure is shown only after a real submit attempt.
  | { kind: "failed"; code: ContactErrorCode; submitted: boolean };

const FIELDS: FieldName[] = ["name", "email", "subject", "message"];
const EMPTY: Values = { name: "", email: "", subject: "", message: "" };

const LABEL: Record<FieldName, ContactCopyId> = {
  name: "contact.field.name.label",
  email: "contact.field.email.label",
  subject: "contact.field.subject.label",
  message: "contact.field.message.label",
};

const FAIL_BODY: Record<ContactErrorCode, ContactCopyId> = {
  network: "contact.fail.network",
  provider: "contact.fail.provider",
  rate_limited: "contact.fail.rate",
  spam: "contact.fail.spam",
  validation: "contact.fail.validation",
};

// Same shape the adapter accepts, so the form never passes what it would reject.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
// Mail clients and some browsers truncate or refuse longer mailto: URLs.
const MAILTO_BODY_MAX = 1800;
const SLOW_MS = 8000;
// Counter thresholds (contact.md §3.1), each announced once.
const COUNTER_SHOW = 4000;
const COUNTER_ANNOUNCE = [4000, 4750, 5000];

const fieldId = (f: FieldName) => `contact-${f}`;
const errorId = (f: FieldName) => `contact-${f}-error`;
const num = (n: number) => n.toLocaleString("en-US");

function validateField(field: FieldName, raw: string): ContactCopyId | undefined {
  const value = raw.trim();
  switch (field) {
    case "name":
      if (!value) return "contact.error.name.required";
      if (value.length > L.nameMax) return "contact.error.name.long";
      return undefined;
    case "email":
      if (!value) return "contact.error.email.required";
      if (value.length > L.emailMax) return "contact.error.email.long";
      if (!EMAIL_RE.test(value)) return "contact.error.email.invalid";
      return undefined;
    case "subject":
      return value.length > L.subjectMax ? "contact.error.subject.long" : undefined;
    case "message":
      if (!value) return "contact.error.message.required";
      if (value.length < L.messageMin) return "contact.error.message.short";
      if (value.length > L.messageMax) return "contact.error.message.long";
      return undefined;
  }
}

function validateAll(values: Values): Errors {
  const errors: Errors = {};
  for (const f of FIELDS) {
    const e = validateField(f, values[f]);
    if (e) errors[f] = e;
  }
  return errors;
}

function mailtoHref(values: Values): { href: string; tooLong: boolean } {
  const subject = encodeURIComponent(values.subject.trim() || t("contact.mailto.subject"));
  const body = encodeURIComponent(values.message);
  const tooLong = body.length > MAILTO_BODY_MAX;
  const href = `mailto:${site.email}?subject=${subject}${!tooLong && body ? `&body=${body}` : ""}`;
  return { href, tooLong };
}

const subscribeNothing = () => () => {};

export default function ContactForm() {
  // False in the server HTML and during hydration, true once React runs. The
  // submit button stays `disabled` until then, so Enter before hydration
  // cannot fire a native GET that would put the message in the URL.
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<Status>(() =>
    // NEXT_PUBLIC_* is inlined at build, so server and client agree here.
    isContactConfigured()
      ? { kind: "idle" }
      : { kind: "unconfigured" },
  );
  const [slow, setSlow] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [focusRequest, setFocusRequest] = useState<{ target: string; n: number } | null>(null);

  const busy = useRef(false);
  const mountedAt = useRef(0);
  const announced = useRef(new Set<number>());
  const slowTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const honeypot = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const controls: Record<FieldName, RefObject<HTMLInputElement | HTMLTextAreaElement | null>> = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    subject: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

  useEffect(() => {
    mountedAt.current = performance.now();
    return () => clearTimeout(slowTimer.current);
  }, []);

  // Focus moves after the block it targets has rendered.
  useEffect(() => {
    if (!focusRequest) return;
    const { target } = focusRequest;
    const el =
      target === "summary"
        ? summaryRef.current
        : target === "panel"
          ? panelRef.current
          : target === "success"
            ? successRef.current
            : controls[target as FieldName]?.current;
    el?.focus();
    // `controls` holds stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest]);

  const requestFocus = (target: string) =>
    setFocusRequest((prev) => ({ target, n: (prev?.n ?? 0) + 1 }));

  const allErrors = validateAll(values);
  const shown = (f: FieldName) => (submitAttempted || touched[f] ? allErrors[f] : undefined);
  const summaryItems = submitAttempted ? FIELDS.filter((f) => allErrors[f]) : [];
  const isBusy = status.kind === "busy";

  function onChange(field: FieldName, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (field === "message") {
      const prev = values.message.length;
      for (const at of COUNTER_ANNOUNCE) {
        if (prev < at && value.length >= at && !announced.current.has(at)) {
          announced.current.add(at);
          setAnnouncement(
            at >= L.messageMax
              ? t("contact.counter.status.limit")
              : t("contact.counter.status.warn", { n: num(L.messageMax - at) }),
          );
        }
      }
    }
  }

  function onBlur(field: FieldName) {
    if (!touched[field]) setTouched((s) => ({ ...s, [field]: true }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return; // double submit is a no-op

    setSubmitAttempted(true);
    if (Object.keys(allErrors).length > 0) {
      // One block at a time: the summary replaces any earlier failure panel.
      if (status.kind === "failed") setStatus({ kind: "idle" });
      requestFocus("summary");
      return;
    }

    busy.current = true;
    setStatus({ kind: "busy" });
    setSlow(false);
    setAnnouncement(t("contact.status.sending"));
    slowTimer.current = setTimeout(() => setSlow(true), SLOW_MS);

    const trap = honeypot.current?.value ?? "";
    let result: ContactResult;
    try {
      result = await submitContact({
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
        honeypot: trap,
        elapsedMs: performance.now() - mountedAt.current,
      });
    } catch {
      // The adapter promises not to throw; if it does, it is our fault.
      result = { ok: false, code: "provider", message: "" };
    } finally {
      clearTimeout(slowTimer.current);
      busy.current = false;
      setSlow(false);
      setAnnouncement("");
    }

    // A filled honeypot is a bot: show it the success it expects (contact.md
    // §1, "do not fix"). A spam verdict with an empty honeypot may be a fast
    // human, who gets an honest, recoverable failure instead.
    if (result.ok || (result.code === "spam" && trap !== "")) {
      setStatus({ kind: "success" });
      requestFocus("success");
    } else {
      setStatus({ kind: "failed", code: result.code, submitted: true });
      requestFocus("panel");
    }
  }

  function sendAnother() {
    setValues(EMPTY);
    setTouched({});
    setSubmitAttempted(false);
    setAnnouncement("");
    announced.current.clear();
    if (honeypot.current) honeypot.current.value = "";
    mountedAt.current = performance.now(); // restarts elapsedMs
    setStatus({ kind: "idle" });
    requestFocus("name");
  }

  if (status.kind === "unconfigured") {
    return <p className="prose-body" data-testid="contact-unconfigured">{t("contact.unconfigured")}</p>;
  }

  if (status.kind === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="group"
        aria-labelledby="contact-success-title"
        aria-describedby="contact-success-body"
        data-testid="contact-success"
        className="contact-success"
      >
        <h2 id="contact-success-title">{t("contact.success.title")}</h2>
        <p id="contact-success-body">{t("contact.success.body", { email: site.email })}</p>
        <div className="contact-actions">
          <button type="button" className="contact-button contact-button-secondary" onClick={sendAnother}>
            {t("contact.success.again")}
          </button>
          <Link href="/" className="contact-button contact-button-secondary">
            {t("contact.success.home")}
          </Link>
        </div>
      </div>
    );
  }

  const mailto = mailtoHref(values);
  const submitLabel = isBusy
    ? t("contact.submit.busy")
    : status.kind === "failed" && status.submitted
      ? t("contact.submit.retry")
      : t("contact.submit");

  const renderField = (field: FieldName) => {
    const error = shown(field);
    const common = {
      id: fieldId(field),
      name: field,
      value: values[field],
      readOnly: isBusy,
      "aria-invalid": error ? (true as const) : undefined,
      "aria-describedby": error ? errorId(field) : undefined,
      onBlur: () => onBlur(field),
    };
    const length = values.message.length;
    return (
      <div className={error ? "contact-field contact-field-invalid" : "contact-field"}>
        <label htmlFor={fieldId(field)}>
          {t(LABEL[field])}
          {field === "subject" && (
            <span className="contact-optional"> {t("contact.field.optional")}</span>
          )}
        </label>
        {field === "message" ? (
          <textarea
            {...common}
            ref={controls.message as RefObject<HTMLTextAreaElement>}
            required
            rows={6}
            autoComplete="off"
            maxLength={L.messageMax}
            onChange={(e) => onChange(field, e.target.value)}
          />
        ) : (
          <input
            {...common}
            ref={controls[field] as RefObject<HTMLInputElement>}
            {...(field === "name"
              ? { type: "text", required: true, autoComplete: "name", maxLength: L.nameMax }
              : field === "email"
                ? {
                    type: "email",
                    required: true,
                    autoComplete: "email",
                    inputMode: "email" as const,
                    spellCheck: false,
                    maxLength: L.emailMax,
                  }
                : { type: "text", autoComplete: "off", maxLength: L.subjectMax })}
            enterKeyHint="next"
            onChange={(e) => onChange(field, e.target.value)}
          />
        )}
        {field === "message" && length > COUNTER_SHOW && (
          <p className="contact-counter" aria-live="off">
            {t("contact.counter.text", { n: num(length) })}
          </p>
        )}
        {error && <FieldError id={errorId(field)} message={t(error)} />}
      </div>
    );
  };

  return (
    <>
      {summaryItems.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="group"
          aria-labelledby="contact-summary-title"
          data-testid="contact-error-summary"
          className="contact-alert"
        >
          <h2 id="contact-summary-title">
            {summaryItems.length === 1
              ? t("contact.summary.title.one")
              : t("contact.summary.title.many", { n: summaryItems.length })}
          </h2>
          <ul>
            {summaryItems.map((f) => (
              <li key={f}>
                <a
                  href={`#${fieldId(f)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    controls[f].current?.focus();
                  }}
                >
                  {t("contact.summary.item", { label: t(LABEL[f]), message: t(allErrors[f]!) })}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status.kind === "failed" && summaryItems.length === 0 && (
        <div
          ref={panelRef}
          tabIndex={-1}
          role="group"
          aria-labelledby="contact-fail-title"
          className="contact-alert"
        >
          <h2 id="contact-fail-title">{t("contact.fail.title")}</h2>
          <p>{t(FAIL_BODY[status.code])}</p>
          <p data-testid="contact-fallback">
            <a href={mailto.href} className="text-link">
              {t("contact.fail.mailto")}
              <span aria-hidden="true" className="font-mono">
                {"\u00a0→"}
              </span>
            </a>
            {mailto.tooLong && (
              <span className="contact-note"> {t("contact.fail.mailto.toolong")}</span>
            )}
          </p>
        </div>
      )}

      <form
        noValidate
        onSubmit={onSubmit}
        aria-busy={isBusy || undefined}
        data-testid="contact-form"
        className={isBusy ? "contact-form contact-form-busy" : "contact-form"}
      >
        {/* Honeypot (contact.md §3.5): off-screen, unfocusable, out of the
            accessibility tree, and deliberately unlabelled. Not display:none,
            which bots skip. Do not "fix" it. */}
        <div aria-hidden="true" className="contact-honeypot">
          <input ref={honeypot} type="text" name="botcheck" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        {FIELDS.map((f) => (
          <div key={f}>{renderField(f)}</div>
        ))}

        <p className="contact-consent">{t("contact.consent")}</p>

        <div className="contact-actions">
          <button
            type="submit"
            data-testid="contact-submit"
            disabled={!hydrated}
            aria-disabled={isBusy || undefined}
            className="contact-button contact-button-primary"
          >
            {submitLabel}
          </button>
        </div>

        {/* Polite, transient text only (contact.md §6): sending, counter. */}
        <p role="status" className="sr-only">
          {announcement}
        </p>
        <p role="status" className="contact-status">
          {slow ? t("contact.status.slow") : ""}
        </p>
      </form>
    </>
  );
}
