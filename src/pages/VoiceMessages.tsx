import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Play, Pause, Paperclip } from "lucide-react";

const VoiceMessages = () => {
  const [selectedLead, setSelectedLead] = useState("");
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("male_urdu");
  const [speed, setSpeed] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: api.leads,
  });

  const { data: history = [] } = useQuery({
    queryKey: ["voice-history"],
    queryFn: api.voiceHistory,
    refetchInterval: 5000,
  }) as { data: any[] };

  const generate = useMutation({
    mutationFn: () => api.voiceGenerate({ phone: selectedLead, script, voice, speed }),
    onSuccess: (data: any) => {
      setAudioUrl(data?.audio_url || null);
      toast.success("Voice message generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendVoice = useMutation({
    mutationFn: () => api.voiceSend(selectedLead),
    onSuccess: () => { toast.success("Voice message sent"); setAudioUrl(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const voices = [
    { value: "male_urdu", label: "Male (Urdu)" },
    { value: "female_urdu", label: "Female (Urdu)" },
    { value: "male_english", label: "Male (English)" },
    { value: "female_english", label: "Female (English)" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">Voice Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate AI voice messages via Sesame AI and send them to leads.</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Compose</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Select Lead</label>
                <select value={selectedLead} onChange={(e) => setSelectedLead(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Choose a lead…</option>
                  {leads.map((l: any) => <option key={l.phone} value={l.phone}>{l.business_name} — {l.phone}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Message Script</label>
                <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={4} placeholder="What should the AI say…" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Voice</label>
                <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {voices.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Speaking Speed: {speed.toFixed(1)}x</label>
                <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <button onClick={() => generate.mutate()} disabled={!selectedLead || !script.trim() || generate.isPending} className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {generate.isPending ? "Generating…" : "Generate Voice Message"}
              </button>
            </div>
          </div>

          {audioUrl && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="flex-1 h-1.5 bg-muted rounded-full">
                  <div className="h-full w-1/3 bg-primary rounded-full" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => generate.mutate()} className="flex-1 h-9 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Re-generate</button>
                <button onClick={() => sendVoice.mutate()} disabled={sendVoice.isPending} className="flex-1 h-9 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {sendVoice.isPending ? "Sending…" : "Send to Lead"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Sent Voice Messages</h3>
          </div>
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">No voice messages sent yet</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-left">
                    {["Lead", "Phone", "Date", "Duration", "Status"].map((h) => (
                      <th key={h} className="px-3 py-2 text-xs text-muted-foreground font-medium">{h}</th>
                    ))}
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((h: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-3 py-2 text-foreground">{h.lead_name}</td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{h.phone}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{h.date}</td>
                      <td className="px-3 py-2 text-foreground">{h.duration}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${h.status === "delivered" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-3 py-2"><button className="text-primary hover:text-primary/80"><Play className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceMessages;