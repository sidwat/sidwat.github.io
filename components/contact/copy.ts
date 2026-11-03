// Generated 1:1 from docs/design/copy.md (all `contact.*` IDs). Do not edit by hand:
// change the copy deck, then regenerate. `{placeholders}` are filled with `t()`.
// `contact.honeypot` is "(none)" on purpose: the honeypot has no visible or accessible text.

export const contactCopy = {
  "contact.unconfigured": "Please email me directly using the address below.",
  "contact.meta.title": "Contact",
  "contact.meta.description": "Send Sidhartha Watsa a message about anything.",
  "contact.label": "Contact",
  "contact.title": "Get in touch",
  "contact.intro": "Write to me about anything: research, a collaboration, a correction, a question about a post.",
  "contact.field.name.label": "Name",
  "contact.field.email.label": "Email",
  "contact.field.subject.label": "Subject",
  "contact.field.message.label": "Message",
  "contact.field.optional": "(optional)",
  "contact.counter.text": "{n} / 5,000",
  "contact.counter.status.warn": "{n} characters left",
  "contact.counter.status.limit": "Character limit reached",
  "contact.consent": "Messages go through a third-party form service to my inbox, and the service may keep a copy for a short time. I use what you send only to reply to you.",
  "contact.submit": "Send message",
  "contact.submit.busy": "Sending…",
  "contact.submit.retry": "Try again",
  "contact.status.sending": "Sending your message",
  "contact.status.slow": "Still sending… this is taking longer than usual.",
  "contact.error.prefix": "Error:",
  "contact.error.name.required": "Enter your name.",
  "contact.error.name.long": "Use 100 characters or fewer.",
  "contact.error.email.required": "Enter your email so I can reply.",
  "contact.error.email.invalid": "Enter an email like name@example.com",
  "contact.error.email.long": "Use 254 characters or fewer.",
  "contact.error.subject.long": "Use 150 characters or fewer.",
  "contact.error.message.required": "Write a message.",
  "contact.error.message.short": "Write at least 10 characters.",
  "contact.error.message.long": "Use 5,000 characters or fewer.",
  "contact.summary.title.one": "Fix 1 field before sending",
  "contact.summary.title.many": "Fix {n} fields before sending",
  "contact.summary.item": "{label}: {message}",
  "contact.fail.title": "Message not sent",
  "contact.fail.network": "Could not reach the message service. Your message is still here: check your connection and press Try again, or email me directly.",
  "contact.fail.provider": "The message service had a problem. Your message is still here: press Try again in a moment, or email me directly.",
  "contact.fail.rate": "Too many messages right now. Try again later or email me directly. Your message is still here.",
  "contact.fail.spam": "The spam filter held this message back. Check it for links, wait a few seconds, then press Try again, or email me directly.",
  "contact.fail.validation": "The service rejected something in the form. Check your entries and press Try again, or email me directly.",
  "contact.fail.mailto": "Email me instead",
  "contact.fail.mailto.toolong": "Your message is too long to prefill. It is still in the box: copy it into your email.",
  "contact.success.title": "Message sent",
  "contact.success.body": "Thanks — I read everything and reply from {email}.",
  "contact.success.again": "Send another",
  "contact.success.home": "Back to home",
  "contact.alt": "Or email {email}",
  "contact.noscript": "The contact form needs JavaScript to run. You can still email me at {email}.",
  "contact.mailto.subject": "Message from sidwat.github.io",
  "contact.honeypot": "(none)",
} as const;

export type ContactCopyId = keyof typeof contactCopy;

/** Look up a copy string and fill its `{placeholders}`. Unknown placeholders are left as is. */
export function t(id: ContactCopyId, vars: Record<string, string | number> = {}): string {
  return contactCopy[id].replace(/\{([a-z]+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}
