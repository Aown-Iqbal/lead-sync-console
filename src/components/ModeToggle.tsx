import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type LeadMode } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  phone: string;
  mode: LeadMode;
}

export function ModeToggle({ phone, mode }: Props) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (next: LeadMode) => api.setMode(phone, next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["conversation", phone] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to switch mode"),
  });

  const next: LeadMode = mode === "ai" ? "human" : "ai";
  const isAi = mode === "ai";

  return (
    <button
      type="button"
      disabled={mut.isPending}
      onClick={(e) => {
        e.stopPropagation();
        mut.mutate(next);
      }}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-sm transition-colors ${
        isAi
          ? "border-primary/30 text-primary bg-primary/10 hover:bg-primary/20"
          : "border-amber/30 text-amber bg-amber/10 hover:bg-amber/20"
      } disabled:opacity-50`}
    >
      <span className="w-1 h-1 rounded-full bg-current" />
      {mode}
    </button>
  );
}