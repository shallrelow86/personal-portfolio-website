export default function BrutalCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-2 border-border bg-surface p-6 hover:border-accent transition-colors ${className}`}
    >
      {children}
    </div>
  );
}
