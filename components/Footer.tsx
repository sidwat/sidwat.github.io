import Link from "next/link";
import { shellCopy, site, socials } from "@/lib/site";

// Hit height (docs/design/contact.md §9): 28px for fine pointers, 44px under
// a coarse pointer. Below sm the contact column sits under the socials and is
// left-aligned; from sm it is right-aligned.
const hit =
  "flex items-center justify-start min-h-11 sm:justify-end";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8 px-6 py-14">
        <div>
          <p className="eyebrow">{shellCopy["footer.elsewhere"]}</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.9375rem] text-muted transition-colors hover:text-luma"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/motion-studies/" className="quiet-link mt-4 text-sm">Motion studies <span aria-hidden="true">↗</span></Link>
        </div>

        <div className="text-left sm:text-right">
          {/* The mailto stays for anyone who would rather use their own mail
              client; the form is the second way in. */}
          <p className="eyebrow">{shellCopy["footer.touch"]}</p>
          <a
            href={`mailto:${site.email}`}
            className={`${hit} mt-4 text-[0.9375rem] text-muted transition-colors hover:text-luma`}
          >
            {site.email}
          </a>
          <Link href="/contact/" className={`text-link ${hit} text-[0.9375rem]`}>
            {shellCopy["footer.write"]}
            <span aria-hidden="true" className="font-mono">
              {" →"}
            </span>
          </Link>
          <p className="eyebrow mt-6">
            {shellCopy["footer.copyright"]
              .replace("{year}", String(new Date().getFullYear()))
              .replace("{name}", site.name)}
          </p>
        </div>
      </div>
    </footer>
  );
}
