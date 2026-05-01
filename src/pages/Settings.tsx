import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const Settings = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState<"leads" | "scraper" | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: api.settings,
  });

  const clearLeads = useMutation({
    mutationFn: api.clearAll,
    onSuccess: () => {
      toast.success("All lead states cleared");
      setConfirmOpen(null);
      setConfirmText("");
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const clearScraper = useMutation({
    mutationFn: api.clearScraperJobs,
    onSuccess: () => {
      toast.success("Scraper jobs reset");
      setConfirmOpen(null);
      setConfirmText("");
      qc.invalidateQueries({ queryKey: ["scraper-jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeHours = new Set((settings?.batch_hours || []).map((h: string) => parseInt(h)));

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-lg font-semibold text-foreground mb-6">Settings</h1>

      {/* Batch Schedule */}
      <div className="bg-card border border-border rounded-lg mb-6">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Batch Schedule</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Active Send Hours</label>
            <div className="flex flex-wrap gap-1">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className={`w-9 h-8 rounded-lg flex items-center justify-center text-xs font-mono ${
                    activeHours.has(h) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {h}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Batch size</span>
            <span className="font-mono text-sm text-foreground">{settings?.batch_size ?? "—"}</span>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border pt-3">Edit via server config.</p>
        </div>
      </div>

      {/* Account */}
      <div className="bg-card border border-border rounded-lg mb-6">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Account</h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Display Name</label>
            <input defaultValue={user?.name} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Email</label>
            <input value={user?.email} readOnly className="w-full h-9 px-3 rounded-lg border border-border bg-muted text-sm text-muted-foreground" />
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Current Password</label>
              <input type="password" className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">New Password</label>
              <input type="password" className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Confirm</label>
              <input type="password" className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <button className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mt-2">Save</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-danger/30 rounded-lg">
        <div className="px-5 py-3 border-b border-danger/30">
          <h2 className="text-sm font-medium text-danger">Danger Zone</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Clear All Lead States</div>
              <div className="text-xs text-muted-foreground mt-0.5">Deletes every lead and conversation. Cannot be undone.</div>
            </div>
            <button onClick={() => { setConfirmOpen("leads"); setConfirmText(""); }} className="h-9 px-4 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors">Clear All</button>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <div className="text-sm text-foreground font-medium">Reset Scraper Jobs</div>
              <div className="text-xs text-muted-foreground mt-0.5">Deletes all scraper job history. Cannot be undone.</div>
            </div>
            <button onClick={() => { setConfirmOpen("scraper"); setConfirmText(""); }} className="h-9 px-4 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors">Reset Jobs</button>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmOpen(null)}>
          <div className="bg-card border border-border rounded-lg w-[420px] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-foreground mb-2">
              {confirmOpen === "leads" ? "Clear all lead states?" : "Reset scraper jobs?"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action is permanent. Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-danger/30 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmOpen(null)} className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button
                disabled={confirmText !== "DELETE" || clearLeads.isPending || clearScraper.isPending}
                onClick={() => confirmOpen === "leads" ? clearLeads.mutate() : clearScraper.mutate()}
                className="h-9 px-4 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90 disabled:opacity-50 transition-colors"
              >
                {(clearLeads.isPending || clearScraper.isPending) ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;