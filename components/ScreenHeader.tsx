import Link from "next/link";

export default function ScreenHeader({
  index,
  eyebrow,
  title,
  href,
  linkLabel = "全部 →",
}: {
  index: string;
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-10 md:mb-12">
      <div>
        <p className="section-index mb-2">{index}</p>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="font-display text-4xl md:text-5xl italic leading-tight tracking-tight">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="brutal-btn-text shrink-0">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
