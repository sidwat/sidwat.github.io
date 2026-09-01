export default function PageHeader({
  title,
  intro,
}: {
  title: string;
  intro: string;
}) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-muted">{intro}</p>
    </div>
  );
}
