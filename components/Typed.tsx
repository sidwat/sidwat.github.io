"use client";

import { useEffect, useRef } from "react";

type Props = {
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Milliseconds to wait before the first character appears. */
  startDelay?: number;
  /** Leave the caret blinking when this block finishes. */
  keepCaret?: boolean;
};

/**
 * Types text out a character at a time, like a line being written at a shell.
 *
 * Every character is rendered up front and revealed by opacity rather than
 * appended to a growing string. That costs one span per character, and buys
 * three things: the full text is in the server-rendered HTML for crawlers, it
 * is in the accessibility tree from the start so a screen reader is never made
 * to wait, and the layout never reflows, so there is no shift as it types.
 *
 * Caller supplies the element and its styling; this fills it in.
 */
export default function Typed({
  text,
  speed = 18,
  startDelay = 0,
  keepCaret = false,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const chars = Array.from(
      root.querySelectorAll<HTMLElement>("[data-char]"),
    );
    const caret = root.querySelector<HTMLElement>("[data-caret]");

    const reveal = () => chars.forEach((c) => (c.style.opacity = "1"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      if (caret) caret.style.opacity = keepCaret ? "1" : "0";
      return;
    }

    let i = 0;
    let timer = 0;

    const tick = () => {
      if (i >= chars.length) {
        if (caret) {
          if (keepCaret) caret.classList.add("caret-blink");
          else caret.style.opacity = "0";
        }
        return;
      }
      const ch = chars[i];
      ch.style.opacity = "1";
      // The caret rides the typing head rather than sitting at the end of the
      // reserved text, which is where it would otherwise be.
      if (caret) ch.parentNode?.insertBefore(caret, ch.nextSibling);
      i += 1;
      // Jitter, so it reads as someone typing rather than as a metronome.
      timer = window.setTimeout(tick, speed * (0.65 + Math.random() * 0.7));
    };

    const begin = () => {
      if (caret) {
        caret.style.opacity = "1";
        if (chars[0]) chars[0].parentNode?.insertBefore(caret, chars[0]);
      }
      tick();
    };

    timer = window.setTimeout(begin, startDelay);
    return () => window.clearTimeout(timer);
  }, [text, speed, startDelay, keepCaret]);

  // Words are inline-block so a line can never break inside one, even though
  // every character is a separate inline box. Whitespace runs stay as their
  // own characters, which keeps the break opportunities between words.
  const parts = text.split(/(\s+)/);

  return (
    <span ref={ref} className="typed">
      {parts.map((part, pi) =>
        /^\s+$/.test(part) ? (
          <span key={pi} data-char style={{ opacity: 0 }}>
            {part}
          </span>
        ) : (
          <span key={pi} className="inline-block">
            {Array.from(part).map((ch, ci) => (
              <span key={ci} data-char style={{ opacity: 0 }}>
                {ch}
              </span>
            ))}
          </span>
        ),
      )}
      <span data-caret aria-hidden="true" className="caret" style={{ opacity: 0 }} />
    </span>
  );
}
