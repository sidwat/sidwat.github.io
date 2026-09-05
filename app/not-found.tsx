import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { nav } from "@/lib/site";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="404"
        title="No such page"
        intro="That address does not exist here — it may have moved when the site was rebuilt, or never existed at all."
      />

      <p className="eyebrow mt-12">Try one of these</p>
      <ul className="mt-6 border-t border-line">
        {nav.map((item) => (
          <li key={item.href} className="border-b border-line">
            <Link
              href={item.href}
              className="group flex items-baseline justify-between py-5 transition-colors hover:text-cb"
            >
              <span className="text-[1.375rem]">{item.label}</span>
              <span aria-hidden="true" className="font-mono text-sm">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
