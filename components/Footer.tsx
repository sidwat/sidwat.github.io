import { site, socials } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-8 px-6 py-14">
        <div>
          <p className="eyebrow">Elsewhere</p>
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
        </div>

        <p className="eyebrow">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
