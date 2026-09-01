import Link from "next/link";
import { nav, site } from "@/lib/site";

export default function Home() {
  return (
    <div>
      <p className="text-sm text-muted">
        {site.role} · {site.location}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        {site.name}
      </h1>

      <p className="mt-6 leading-relaxed text-muted">
        I work on computer vision, robotics, and deep learning. I studied
        Mechanical and Electrical Engineering at IIT Kanpur, worked on imitation
        learning at the Robert Bosch Centre for Cyber Physical Systems at IISc
        Bangalore, and am now at Samsung Research Institute Bangalore, where I
        contribute to next-generation video codec standards in the AI Video
        Processing Lab.
      </p>

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {nav
          .filter((item) => item.href !== "/")
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-accent underline-offset-4 hover:underline"
            >
              {item.label}
            </Link>
          ))}
      </nav>
    </div>
  );
}
