"use client";

import { useCallback } from "react";

/**
 * Switches the page between ink and the colour of the wall in the portrait.
 *
 * Deliberately holds no React state: the current theme lives in a data
 * attribute on <html>, and CSS decides which label to show. That keeps the
 * server and client markup identical — a state-backed version would render the
 * wrong label until hydration, and flash on every load for anyone whose stored
 * choice is not the default.
 */
export default function ThemeToggle() {
  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next = root.dataset.theme === "studio" ? "plate" : "studio";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* Private mode or blocked storage: the choice just does not persist. */
    }
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      className="group ml-auto inline-flex items-center gap-2 self-center"
    >
      <span className="sr-only on-plate">
        Switch the background to the studio wall colour
      </span>
      <span className="sr-only on-studio">Switch the background to ink</span>

      <span
        aria-hidden="true"
        className="size-2.5 rounded-full border border-line transition-colors"
        style={{ background: "var(--swatch-next)" }}
      />
      <span
        aria-hidden="true"
        className="eyebrow transition-colors group-hover:text-luma"
      >
        <span className="on-plate">#E9D5A3</span>
        <span className="on-studio">#08090E</span>
      </span>
    </button>
  );
}
