interface StatCardProps {
  label: string;
  value: number | string;
  accent?: "default" | "amber" | "primary";
}

export function StatCard({ label, value, accent = "default" }: StatCardProps) {
  const valueColor =
    accent === "amber"
      ? "text-amber"
      : accent === "primary"
      ? "text-primary"
      : "text-foreground";
  return (
    <div className="border border-border bg-surface px-4 py-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-mono tabular-nums ${valueColor}`}>
        {value}
      </div>
    </div>
  );
}