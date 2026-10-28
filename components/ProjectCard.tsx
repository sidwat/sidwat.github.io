import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content";

import { projectPictures as pictures } from "@/lib/project-media";

export default function ProjectCard({ project, level = 3 }: { project: Project; level?: 2 | 3 }) {
  const Title = level === 2 ? "h2" : "h3";
  const picture = pictures[project.slug];
  return (
    <Link prefetch={false} href={`/projects/${project.slug}/`} className="work-card project-ticket">
      <div className={`project-photo${picture?.transparent ? " project-media-transparent" : ""}`}>
        {picture ? <><Image src={picture.src} alt={picture.alt} width={640} height={360} sizes="(max-width: 768px) 100vw, 33vw" /><span>Illustrative image</span></> : <div className="project-word" aria-hidden="true">{project.symbol}</div>}
      </div>
      <div className="work-card-body">
        <p className="eyebrow">{project.affiliation}</p>
        <Title>{project.title}</Title>
        <p className="prose-body">{project.points[0]}</p>
        <span className="quiet-link">View project <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
