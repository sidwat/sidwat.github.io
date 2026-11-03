"use client";

import { useEffect } from "react";

export default function ThemeToggle() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = () => {
      try {
        if (["light", "dark"].includes(localStorage.getItem("theme") ?? "")) return;
      } catch { /* System preference still works when storage is blocked. */ }
      document.documentElement.dataset.theme = query.matches ? "dark" : "light";
    };
    query.addEventListener("change", followSystem);
    return () => query.removeEventListener("change", followSystem);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch { /* Choice remains for this visit. */ }
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggle}>
      <svg className="theme-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z" /></svg>
      <svg className="theme-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>
      <span className="theme-to-dark">Dark mode</span><span className="theme-to-light">Light mode</span>
    </button>
  );
}
