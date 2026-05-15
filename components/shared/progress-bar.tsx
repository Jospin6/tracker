export function ProgressBar({
  displayValue,
  label,
  value,
}: {
  displayValue?: number;
  label: string;
  value: number;
}) {
  const width = Math.max(0, Math.min(value, 100));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>{label}</span>
        <span>{displayValue ?? value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
