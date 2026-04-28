import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, relativeTime, truncate, type Lead } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ModeToggle } from "@/components/ModeToggle";
import { ConversationPanel } from "@/components/ConversationPanel";

const Index = () => {
  const [selected, setSelected] = useState<Lead | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: api.stats,
    refetchInterval: 5000,
  });

  const { data: leads = [], isLoading, isError, error } = useQuery({
    queryKey: ["leads"],
    queryFn: api.leads,
    refetchInterval: 5000,
  });

  return (
    <div className="px-8 py-6">
      <header className="flex items-baseline justify-between mb-6">
        <h1 className="text-[15px] font-medium text-foreground">Leads</h1>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          polling · 5s
        </span>
      </header>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={stats?.total ?? "—"} />
        <StatCard label="Active" value={stats?.active ?? "—"} accent="primary" />
        <StatCard label="Pending" value={stats?.pending ?? "—"} />
        <StatCard label="Human Needed" value={stats?.human_needed ?? "—"} accent="amber" />
      </div>

      <div className="border border-border bg-surface">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left">
              {["Business", "Phone", "Status", "Mode", "Last Message", "Last Active"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground font-mono text-[12px]">
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-danger font-mono text-[12px]">
                  {(error as Error)?.message ?? "Failed to load leads"}
                </td>
              </tr>
            )}
            {!isLoading && !isError && leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground font-mono text-[12px]">
                  No leads yet.
                </td>
              </tr>
            )}
            {leads.map((l) => (
              <tr
                key={l.phone}
                onClick={() => setSelected(l)}
                className="border-b border-border last:border-b-0 hover:bg-secondary/40 cursor-pointer transition-colors"
              >
                <td className="px-3 py-2 text-foreground">{l.business_name}</td>
                <td className="px-3 py-2 font-mono text-[12px] text-muted-foreground">{l.phone}</td>
                <td className="px-3 py-2"><StatusBadge status={l.status} /></td>
                <td className="px-3 py-2"><ModeToggle phone={l.phone} mode={l.mode} /></td>
                <td className="px-3 py-2 text-muted-foreground">{truncate(l.last_message, 50) || "—"}</td>
                <td className="px-3 py-2 font-mono text-[12px] text-muted-foreground">{relativeTime(l.last_active)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConversationPanel lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Index;