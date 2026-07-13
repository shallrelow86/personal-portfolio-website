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
  return (
    <label className="block mb-4">
      {label && (
        <span className="block font-mono text-xs tracking-wider text-text-secondary mb-1.5">
          {label}
        </span>
      )}
      {multiline ? (
        <textarea
          {...props}
          rows={rows || 12}
          className="brutal-input resize-y"
          onChange={(e) => props.onChange(e.target.value)}
        />
      ) : (
        <input
          {...props}
          className="brutal-input"
          onChange={(e) => props.onChange(e.target.value)}
        />
      )}
    </label>
  );
}
