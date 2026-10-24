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
    <header className="page-heading">
      <p className="eyebrow">{label}</p>
      <h1 className="display mt-4">{title}</h1>
      <p className="prose-body mt-5 max-w-2xl">{intro}</p>
    </header>
  );
}
