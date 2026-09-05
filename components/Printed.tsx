"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  /** Whether the step that produces this output has finished. */
  show: boolean;
  /** Milliseconds to wait after that, for spacing within a step. */
  delay?: number;
  children: ReactNode;
};

/**
 * Reveals its content in one go after a delay — command output, as opposed to
 * the command itself, which is typed. A shell prints its output; it does not
 * type it, and typing a long paragraph at human speed would take half a minute.
 *
 * Content is in the DOM from the start, so crawlers and screen readers get it
 * immediately and nothing reflows when it appears.
 */
export default function Printed({ show, delay = 0, children }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !show) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      return;
    }

    const timer = window.setTimeout(() => {
      el.style.opacity = "1";
    }, delay);
    return () => window.clearTimeout(timer);
  }, [show, delay]);

  return (
    <span
      ref={ref}
      style={{ opacity: 0, transition: "opacity 140ms ease-out" }}
    >
      {children}
    </span>
  );
}
