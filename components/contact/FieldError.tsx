import { t } from "./copy";

/**
 * Inline field error (tokens.md §4.3): on the page ground, never inside a
 * `--surface` box, with a glyph and a visually hidden "Error:" prefix so the
 * colour never carries the meaning alone. The control points at `id` with
 * `aria-describedby`.
 */
export default function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="contact-error">
      <span aria-hidden="true" className="contact-glyph">
        !
      </span>
      <span>
        <span className="sr-only">{t("contact.error.prefix")} </span>
        {message}
      </span>
    </p>
  );
}
