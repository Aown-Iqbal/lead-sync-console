interface StatCardProps {
  label: string;
  value: number | string;
  accent?: "default" | "amber" | "primary";
}

const borderColors = {
  default: "border-l-border",
  primary: "border-l-primary",
  amber: "border-l-amber",
};

export function StatCard({ label, value, accent = "default" }: StatCardProps) {
  return (
    <div className={`border border-border rounded-lg bg-card px-4 py-3.5 border-l-[3px] ${borderColors[accent]}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}