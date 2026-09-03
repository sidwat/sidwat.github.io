import Link from "next/link";
import Hero from "@/components/Hero";
import PeekAvatar from "@/components/PeekAvatar";
import { nav } from "@/lib/site";

export default function Home() {
  return (
    <>
      <PeekAvatar />
      <Hero />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="eyebrow">Sections</h2>
        <ul className="mt-8 border-t border-line">
          {nav
            .filter((item) => item.href !== "/")
            .map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  className="group flex items-baseline justify-between gap-6 py-5 transition-colors hover:text-cb"
                >
                  <span className="display text-[clamp(1.5rem,4vw,2.25rem)]">
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm text-muted transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
