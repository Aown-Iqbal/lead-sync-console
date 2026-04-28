import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Lead } from "@/lib/api";
import { ModeToggle } from "./ModeToggle";
import { toast } from "sonner";

interface Props {
  lead: Lead | null;
  onClose: () => void;
}

export function ConversationPanel({ lead, onClose }: Props) {
  const open = !!lead;
  const phone = lead?.phone ?? "";
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["conversation", phone],
    queryFn: () => api.conversation(phone),
    enabled: open,
    refetchInterval: open ? 5000 : false,
  });

  const send = useMutation({
    mutationFn: (t: string) => api.send(phone, t),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["conversation", phone] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to send"),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    send.mutate(t);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-screen w-[420px] bg-surface border-l border-border z-50 flex flex-col">
        <header className="px-4 h-14 border-b border-border flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-foreground truncate">
              {lead.business_name}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {lead.phone}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle phone={lead.phone} mode={lead.mode} />
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-lg leading-none px-1"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </header>

        {lead.mode === "human" && (
          <div className="px-4 py-2 bg-amber/10 border-b border-amber/20 text-[11px] font-mono uppercase tracking-wider text-amber">
            Human takeover active
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="text-[12px] text-muted-foreground font-mono">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="text-[12px] text-muted-foreground font-mono">No messages yet.</div>
          ) : (
            messages.map((m, i) => {
              const isOut = m.direction === "outbound";
              const senderLabel =
                m.sender === "human" ? "human" : m.sender === "ai" ? "ai" : isOut ? "ai" : "lead";
              return (
                <div key={m.id ?? i} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${isOut ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                    <div
                      className={`px-2.5 py-1.5 text-[13px] leading-relaxed border rounded-sm whitespace-pre-wrap break-words ${
                        isOut
                          ? m.sender === "human"
                            ? "bg-amber/10 border-amber/30 text-foreground"
                            : "bg-primary/10 border-primary/30 text-foreground"
                          : "bg-secondary border-border text-foreground"
                      }`}
                    >
                      {m.text}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {senderLabel} · {new Date(m.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={onSubmit} className="border-t border-border p-3 flex gap-2 shrink-0">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={lead.mode === "human" ? "Reply as human…" : "Send manual message…"}
            className="flex-1 bg-background border border-border rounded-sm px-2.5 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <button
            type="submit"
            disabled={send.isPending || !text.trim()}
            className="px-3 py-1.5 text-[12px] font-mono uppercase tracking-wider bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </aside>
    </>
  );
}