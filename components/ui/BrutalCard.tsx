export default function BrutalCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`brutal-card ${className}`}>{children}</div>;
}
