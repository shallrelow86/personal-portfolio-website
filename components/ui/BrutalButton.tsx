import Link from "next/link";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  primary?: boolean;
};

export default function BrutalButton({ children, href, primary, className = "", ...props }: Props) {
  const base = `brutal-btn ${primary ? "brutal-btn-primary" : ""} ${className}`;
  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }
  return (
    <button className={base} {...props}>
      {children}
    </button>
  );
}
