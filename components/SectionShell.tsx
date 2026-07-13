export default function SectionShell({
  index,
  eyebrow,
  title,
  children,
}: {
  index: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        <div className="md:col-span-3 md:pt-1">
          <p className="section-index mb-2">{index}</p>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="font-display text-3xl md:text-4xl italic leading-tight">{title}</h2>
        </div>
        <div className="md:col-span-9">{children}</div>
      </div>
    </section>
  );
}
