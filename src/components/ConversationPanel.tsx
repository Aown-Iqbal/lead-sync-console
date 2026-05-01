import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Lead } from "@/lib/api";
import { StatusBadge } from "./StatusBadge";
import { ModeToggle } from "./ModeToggle";
import { toast } from "sonner";
import { X, Paperclip, Send } from "lucide-react";

type Tab = "conversation" | "info" | "activity";

interface Props {
  lead: Lead | null;
  onClose: () => void;
}

export function ConversationPanel({ lead, onClose }: Props) {
  const open = !!lead;
  const phone = lead?.phone ?? "";
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [tab, setTab] = useState<Tab>("conversation");
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    send.mutate(t);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "conversation", label: "Conversation" },
    { key: "info", label: "Lead Info" },
    { key: "activity", label: "Activity" },
  ];

  return (
    <aside className="fixed top-0 right-0 h-screen w-[480px] bg-card border-l border-border z-40 flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{lead!.business_name}</h3>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{lead!.phone}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={lead!.status} />
          <ModeToggle phone={lead!.phone} mode={lead!.mode} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              tab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {lead!.status === "human_needed" && tab === "conversation" && (
        <div className="px-4 py-2 bg-amber/10 border-b border-amber/20 text-xs font-medium text-amber shrink-0">
          ⚠ AI paused — you are in control.
        </div>
      )}

      {/* Tab content */}
      {tab === "conversation" && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-3xl mb-2">💬</div>
                <div className="text-sm text-muted-foreground">No messages yet</div>
              </div>
            ) : (
              messages.map((m, i) => {
                const isOut = m.direction === "outbound";
                const senderLabel = m.sender === "human" ? "human" : m.sender === "ai" ? "ai" : isOut ? "ai" : "lead";
                return (
                  <div key={m.id ?? i} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] flex flex-col gap-1 ${isOut ? "items-end" : "items-start"}`}>
                      <div className={`px-3 py-2 text-sm leading-relaxed rounded-2xl whitespace-pre-wrap break-words ${
                        isOut
                          ? m.sender === "human"
                            ? "bg-amber text-white rounded-br-md"
                            : "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}>
                        {m.text}
                      </div>
                      <div className="text-[10px] text-muted-foreground px-1">
                        {senderLabel} · {new Date(m.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={onSubmit} className="border-t border-border p-3 flex gap-2 shrink-0">
            <button type="button" disabled className="p-2 text-muted-foreground hover:text-foreground" title="Coming soon">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={lead!.mode === "human" ? "Reply as human…" : "Send manual message…"}
              className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button type="submit" disabled={send.isPending || !text.trim()} className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}

      {tab === "info" && (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="space-y-3">
            {[
              { label: "Business Name", value: lead!.business_name },
              { label: "Phone", value: lead!.phone, mono: true },
              { label: "Status", value: lead!.status },
              { label: "Mode", value: lead!.mode },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className={`text-sm text-foreground ${item.mono ? "font-mono" : ""}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-border text-xs text-muted-foreground">
            Additional lead details will appear here when available from the API.
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-3">
            {["Lead created", "First message sent", "AI conversation started"].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <div>
                  <div className="text-sm text-foreground">{item}</div>
                  <div className="text-xs text-muted-foreground">Activity timeline coming soon</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}