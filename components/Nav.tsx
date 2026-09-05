"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";
import { nav, site } from "@/lib/site";

export default function Nav() {
  const pathname = usePathname();

  // Sticky, not fixed: the bar keeps its place in flow, so a wrapped nav can
  // never sit on top of the page heading.
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-baseline gap-x-8 gap-y-2 px-6 py-4">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-luma transition-colors hover:text-cb"
        >
          {site.name}
        </Link>

        <nav aria-label="Sections" className="flex flex-wrap gap-x-6 gap-y-1">
          {nav
            .filter((item) => item.href !== "/")
            .map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "eyebrow transition-colors hover:text-luma",
                    active && "text-luma",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
