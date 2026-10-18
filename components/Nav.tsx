"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";
import { nav, shellCopy, site } from "@/lib/site";

// Hit height (docs/design/contact.md §8.3): 28px for fine pointers, 44px under
// a coarse pointer, for links, brand and toggle alike.
const hit = "inline-flex items-center min-h-7 pointer-coarse:min-h-11";

export default function Nav() {
  const pathname = usePathname();

  // Layout R1 (contact.md §8.3). Below lg the bar wraps: brand and toggle on
  // the first row, the links on the rows beneath, and the header is static so
  // a three-row bar never pins a third of a small screen. From lg it is one
  // sticky row: brand, links, toggle. DOM order stays brand, nav, toggle, so
  // focus order is unchanged; only the visual order swaps below lg.
  return (
    <header className="relative z-40 border-b border-line/70 bg-ink/85 backdrop-blur-md lg:sticky lg:top-0">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 px-6 py-2 lg:py-3">
        <Link
          href="/"
          className={clsx(
            hit,
            "order-1 font-mono text-sm tracking-tight text-luma transition-colors hover:text-cb",
          )}
        >
          {site.name}
        </Link>

        <nav
          aria-label={shellCopy["nav.aria"]}
          className="order-3 flex basis-full flex-wrap gap-x-6 lg:order-2 lg:basis-auto"
        >
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
                    hit,
                    "eyebrow transition-colors hover:text-luma",
                    // Not colour alone: the luma/muted step is 2.34:1 on studio.
                    active &&
                      "text-luma underline decoration-cb decoration-1 underline-offset-[6px]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {/* ThemeToggle is frozen; the wrapper sets its order, pushes it right
            and gives its button the same hit height as the links. */}
        <div className="order-2 ml-auto flex lg:order-3 [&>button]:min-h-7 pointer-coarse:[&>button]:min-h-11">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
