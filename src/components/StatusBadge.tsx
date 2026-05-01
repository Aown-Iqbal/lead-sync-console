import type { LeadStatus } from "@/lib/api";

const styles: Record<LeadStatus, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-muted text-muted-foreground",
  human_needed: "bg-amber/10 text-amber",
  done: "bg-success/10 text-success",
};

const labels: Record<LeadStatus, string> = {
  active: "Active",
  pending: "Pending",
  human_needed: "Human Needed",
  done: "Done",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${styles[status] ?? styles.pending}`}>
      {labels[status] ?? status}
    </span>
  );
}