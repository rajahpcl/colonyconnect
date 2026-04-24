type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <section className="status-panel">
      <span className="status-panel__eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
