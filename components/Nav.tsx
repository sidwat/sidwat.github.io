"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { nav, shellCopy, site } from "@/lib/site";

export default function Nav() {
  const pathname = usePathname();
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (disclosure.current && !disclosure.current.contains(event.target as Node)) disclosure.current.open = false;
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  function close() { if (disclosure.current) disclosure.current.open = false; }
  const links = nav.map(item => {
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    return <Link prefetch={false} key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => requestAnimationFrame(close)}>{item.label}</Link>;
  });
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link prefetch={false} className="site-brand" href="/" onClick={() => requestAnimationFrame(close)}>{site.name}</Link>
        <nav className="desktop-nav" aria-label={shellCopy["nav.aria"]}>{links}</nav>
        <div className="nav-controls">
          <ThemeToggle />
          <details className="mobile-nav" ref={disclosure} onBlur={event => {
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close();
          }} onKeyDown={event => {
            if (event.key === "Escape") {
              close();
              disclosure.current?.querySelector("summary")?.focus();
            }
          }}>
            <summary>Menu <span aria-hidden="true">＋</span></summary>
            <nav aria-label="Mobile sections">{links}</nav>
          </details>
        </div>
      </div>
    </header>
  );
}
