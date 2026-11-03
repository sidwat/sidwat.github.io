import { usesGalacticTheme } from "@/lib/visual-theme";
import { hero } from "@/lib/content";
import { site } from "@/lib/site";
import ProjectStars from "@/components/ProjectStars";
import Portrait from "@/components/Portrait";

export default function Hero() {
  return (
    <section className="clarity-hero" aria-labelledby="hero-title">
      <p className="eyebrow">{hero.eyebrow}</p>
      <h1 id="hero-title"><span className="hero-name-fallback">{site.name}</span>{usesGalacticTheme() && <ProjectStars label={site.name} name />}</h1>
      <p className="hero-bio">{hero.bio}</p>
      <div className="hero-actions">
        <a href="/cv.pdf" target="_blank" rel="noreferrer" className="primary-button">View CV <span aria-hidden="true">↗</span></a>
        <a href="/cv.pdf" download className="quiet-link">Download PDF <span aria-hidden="true">↓</span></a>
      </div>
      <div className="hero-identity"><Portrait /><p><strong>{site.name}</strong><span>{hero.eyebrow}</span></p></div>
    </section>
  );
}
