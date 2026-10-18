import { site } from "@/lib/site";
import { t, type ContactCopyId } from "./copy";

/**
 * A copy string whose `{email}` becomes a plain mailto link. Server-rendered,
 * so it works without JavaScript: `contact.alt` is always visible under the
 * form, and `contact.noscript` is the no-JS fallback (D-Q1).
 */
export default function EmailLine({ id }: { id: Extract<ContactCopyId, "contact.alt" | "contact.noscript"> }) {
  const [before, after] = t(id).split("{email}");
  return (
    <p className="contact-alt">
      {before}
      <a href={`mailto:${site.email}`} className="text-link">
        {site.email}
      </a>
      {after}
    </p>
  );
}
