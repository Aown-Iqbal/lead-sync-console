import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, relativeTime, truncate, type Lead, type LeadStatus, type LeadMode } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ModeToggle } from "@/components/ModeToggle";
import { ConversationPanel } from "@/components/ConversationPanel";
import { Search, Filter, ArrowUpDown, Download, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 25;

const Index = () => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [modeFilter, setModeFilter] = useState<"all" | LeadMode>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    let result = leads;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.business_name.toLowerCase().includes(q) || l.phone.includes(q));
    }
    if (statusFilter !== "all") result = result.filter((l) => l.status === statusFilter);
    if (modeFilter !== "all") result = result.filter((l) => l.mode === modeFilter);
    return result;
  }, [leads, search, statusFilter, modeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleRow = (phone: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(phone) ? next.delete(phone) : next.add(phone);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === paged.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paged.map((l) => l.phone)));
    }
  };

  const bulkMode = useMutation({
    mutationFn: async (mode: LeadMode) => {
      await Promise.all(Array.from(selectedRows).map((p) => api.setMode(p, mode)));
    },
    onSuccess: () => {
      toast.success("Mode updated");
      setSelectedRows(new Set());
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-foreground">Leads</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search leads…"
              className="h-9 pl-9 pr-3 w-64 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative">
            <button onClick={() => setFilterOpen(!filterOpen)} className="h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg p-4 z-50 space-y-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Status</label>
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(0); }} className="w-full h-8 px-2 rounded border border-border bg-background text-sm text-foreground">
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="human_needed">Human Needed</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Mode</label>
                  <select value={modeFilter} onChange={(e) => { setModeFilter(e.target.value as any); setPage(0); }} className="w-full h-8 px-2 rounded border border-border bg-background text-sm text-foreground">
                    <option value="all">All</option>
                    <option value="ai">AI</option>
                    <option value="human">Human</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <button className="h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort
          </button>
          <button className="h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Total" value={stats?.total ?? "—"} />
        <StatCard label="Active" value={stats?.active ?? "—"} accent="primary" />
        <StatCard label="Pending" value={stats?.pending ?? "—"} />
        <StatCard label="Human Needed" value={stats?.human_needed ?? "—"} accent="amber" />
      </div>

      {/* Bulk actions */}
      {selectedRows.size > 0 && (
        <div className="mb-3 flex items-center gap-3 bg-muted rounded-lg px-4 py-2">
          <span className="text-sm text-foreground font-medium">{selectedRows.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => bulkMode.mutate("ai")} className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">Switch to AI</button>
            <button onClick={() => bulkMode.mutate("human")} className="h-8 px-3 rounded-lg bg-amber text-white text-xs font-medium hover:bg-amber/90">Switch to Human</button>
            <button className="h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground">Export Selected</button>
            <button className="h-8 px-3 rounded-lg border border-danger text-danger text-xs hover:bg-danger/10">Delete Selected</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left bg-surface">
              <th className="px-3 py-2.5 w-10">
                <input type="checkbox" checked={selectedRows.size === paged.length && paged.length > 0} onChange={toggleAll} className="rounded border-border" />
              </th>
              {["Business Name", "Phone", "Status", "Mode", "Last Message", "Last Active", ""].map((h) => (
                <th key={h} className="px-3 py-2.5 text-xs text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-3 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                ))}
              </tr>
            ))}
            {isError && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-danger text-sm">{(error as Error)?.message ?? "Failed to load"}</td></tr>
            )}
            {!isLoading && !isError && paged.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-12 text-center">
                <div className="text-3xl mb-2">📭</div>
                <div className="text-sm text-muted-foreground">No leads found</div>
              </td></tr>
            )}
            {paged.map((l) => (
              <tr key={l.phone} onClick={() => setSelected(l)} className="border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors">
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedRows.has(l.phone)} onChange={() => toggleRow(l.phone)} className="rounded border-border" />
                </td>
                <td className="px-3 py-2.5 text-foreground font-medium">{l.business_name}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{l.phone}</td>
                <td className="px-3 py-2.5"><StatusBadge status={l.status} /></td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}><ModeToggle phone={l.phone} mode={l.mode} /></td>
                <td className="px-3 py-2.5 text-muted-foreground text-sm">{truncate(l.last_message, 50) || "—"}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{relativeTime(l.last_active)}</td>
                <td className="px-3 py-2.5 relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setMenuOpen(menuOpen === l.phone ? null : l.phone)} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {menuOpen === l.phone && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                      <button onClick={() => { setSelected(l); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-muted">View Conversation</button>
                      <button onClick={() => { api.setMode(l.phone, "human").then(() => qc.invalidateQueries({ queryKey: ["leads"] })); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-muted">Switch to Human</button>
                      <button onClick={() => { api.setMode(l.phone, "ai").then(() => qc.invalidateQueries({ queryKey: ["leads"] })); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-muted">Switch to AI</button>
                      <button className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-muted">Mark Done</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="h-8 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-40">Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-8 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      <ConversationPanel lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Index;