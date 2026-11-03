import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/content";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <div className="page-shell detail-page">
    <PageHeader label="Selected work" title="Projects" intro="Codec research at Samsung, and autonomous systems before it." />
    <div className="work-grid mt-12">{projects.map(project => <ProjectCard key={project.slug} project={project} level={2} />)}</div>
  </div>;
}
