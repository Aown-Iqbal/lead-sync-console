import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Settings = () => {
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: api.settings,
  });

  const clear = useMutation({
    mutationFn: api.clearAll,
    onSuccess: () => {
      toast.success("All lead states cleared");
      setConfirmOpen(false);
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to clear"),
  });

  return (
    <div className="px-8 py-6 max-w-3xl">
      <header className="mb-6">
        <h1 className="text-[15px] font-medium text-foreground">Settings</h1>
      </header>

      <section className="border border-border bg-surface mb-6">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-[12px] font-mono uppercase tracking-wider text-muted-foreground">
            Batch Schedule
          </h2>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] text-muted-foreground">Send hours</span>
            <span className="font-mono text-[13px] text-foreground">
              {settings?.batch_hours?.length ? settings.batch_hours.join(", ") : "—"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] text-muted-foreground">Batch size</span>
            <span className="font-mono text-[13px] text-foreground">
              {settings?.batch_size ?? "—"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground pt-2 border-t border-border">
            Read-only. Edit via server config.
          </p>
        </div>
      </section>

      <section className="border border-danger/40 bg-surface">
        <div className="px-4 py-3 border-b border-danger/40">
          <h2 className="text-[12px] font-mono uppercase tracking-wider text-danger">
            Danger Zone
          </h2>
        </div>
        <div className="px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[13px] text-foreground">Clear All Lead States</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Deletes every lead and conversation. This cannot be undone.
            </div>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="px-3 py-1.5 text-[12px] font-mono uppercase tracking-wider bg-danger text-destructive-foreground rounded-sm hover:bg-danger/90"
          >
            Clear All
          </button>
        </div>
      </section>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface border border-border w-[400px] p-5">
            <h3 className="text-[14px] font-medium text-foreground mb-2">
              Clear all lead states?
            </h3>
            <p className="text-[12px] text-muted-foreground mb-5">
              This will permanently delete all leads and conversations. Type confirm by pressing the red button below.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={clear.isPending}
                className="px-3 py-1.5 text-[12px] font-mono uppercase tracking-wider border border-border text-muted-foreground rounded-sm hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => clear.mutate()}
                disabled={clear.isPending}
                className="px-3 py-1.5 text-[12px] font-mono uppercase tracking-wider bg-danger text-destructive-foreground rounded-sm hover:bg-danger/90 disabled:opacity-50"
              >
                {clear.isPending ? "Clearing…" : "Yes, clear all"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;