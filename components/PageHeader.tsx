export default function PageHeader({
  title,
  intro,
  label,
}: {
  title: string;
  intro: string;
  label: string;
}) {
  return (
    <header className="border-b border-line pb-10">
      <p className="eyebrow">{label}</p>
      <h1 className="display mt-4 text-[clamp(2.25rem,6vw,4rem)]">{title}</h1>
      <p className="prose-body mt-5 max-w-xl">{intro}</p>
    </header>
  );
}
