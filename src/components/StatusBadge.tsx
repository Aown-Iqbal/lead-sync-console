import type { LeadStatus } from "@/lib/api";

const styles: Record<LeadStatus, string> = {
  active: "bg-primary/10 text-primary border-primary/30",
  pending: "bg-secondary text-muted-foreground border-border",
  human_needed: "bg-amber/10 text-amber border-amber/30",
  done: "bg-success/10 text-success border-success/30",
};

const labels: Record<LeadStatus, string> = {
  active: "active",
  pending: "pending",
  human_needed: "human needed",
  done: "done",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const cls = styles[status] ?? styles.pending;
  const label = labels[status] ?? status;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-sm ${cls}`}
    >
      {label}
    </span>
  );
}