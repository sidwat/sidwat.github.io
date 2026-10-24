import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content";

const pictures: Record<string, { src: string; alt: string }> = {
  "nnlf-halide": { src: "/media/projects/landscape.jpg", alt: "Alpine landscape used as an illustrative image-processing sample" },
  "neural-loop-filters": { src: "/media/projects/compression.jpg", alt: "Original bird photograph beside a compressed version" },
  "neural-intra-prediction": { src: "/media/projects/flower.jpeg", alt: "Painting used as an illustrative compression sample" },
};

export default function ProjectCard({ project, level = 3 }: { project: Project; level?: 2 | 3 }) {
  const Title = level === 2 ? "h2" : "h3";
  const picture = pictures[project.slug];
  return (
    <Link href={`/projects/${project.slug}/`} className="work-card project-ticket">
      <div className="project-photo">
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
