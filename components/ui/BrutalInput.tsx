type Props = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  required?: boolean;
  rows?: number;
};

export default function BrutalInput({ label, multiline, rows, ...props }: Props) {
  const base =
    "w-full border-2 border-border bg-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors font-body";

  return (
    <label className="block mb-4">
      {label && (
        <span className="block font-mono text-xs uppercase tracking-wider text-text-secondary mb-1.5">
          {label}
        </span>
      )}
      {multiline ? (
        <textarea
          {...props}
          rows={rows || 12}
          className={base + " resize-y"}
          onChange={(e) => props.onChange(e.target.value)}
        />
      ) : (
        <input
          {...props}
          className={base}
          onChange={(e) => props.onChange(e.target.value)}
        />
      )}
    </label>
  );
}
