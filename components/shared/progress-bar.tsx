export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
