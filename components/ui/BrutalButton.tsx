import Link from "next/link";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
};

export default function BrutalButton({ children, href, ...props }: Props) {
  const base =
    "inline-block border-2 border-border px-5 py-2 font-mono text-xs uppercase tracking-wider text-text-primary hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-surface";

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }
  return (
    <button {...props} className={base}>
      {children}
    </button>
  );
}
