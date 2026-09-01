"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { nav, site } from "@/lib/site";

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
        <Link href="/" className="font-medium tracking-tight">
          {site.name}
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {nav
            .filter((item) => item.href !== "/")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "transition-colors hover:text-foreground",
                  pathname.startsWith(item.href)
                    ? "text-foreground"
                    : "text-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
