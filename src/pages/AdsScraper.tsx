import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Upload, Download, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

const AdsScraper = () => {
  const [file, setFile] = useState<File | null>(null);
  const [city, setCity] = useState("Lahore");
  const [findFb, setFindFb] = useState(true);
  const [checkAds, setCheckAds] = useState(true);
  const [skipNoFb, setSkipNoFb] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: results = [] } = useQuery({
    queryKey: ["ads-results", jobId],
    queryFn: () => api.adsResults(jobId!),
    enabled: !!jobId,
    refetchInterval: 5000,
  });

  const startEnrich = useMutation({
    mutationFn: () => api.adsStart({ file: file!, city, find_facebook: findFb, check_ads: checkAds, skip_no_facebook: skipNoFb }),
    onSuccess: (data: any) => {
      toast.success("Enrichment started");
      setJobId(data?.id || null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) setFile(f);
  };

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-foreground">{label}</span>
      <button onClick={() => onChange(!value)} className={`w-9 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"} relative`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${value ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-foreground mb-6">Facebook Ads Scraper</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Enrich with Ad Data</h3>
            <div className="space-y-3">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
              >
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                {file ? (
                  <p className="text-sm text-foreground">{file.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Upload a CSV from Maps Scraper</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <Toggle value={findFb} onChange={setFindFb} label="Find Facebook pages automatically" />
              <Toggle value={checkAds} onChange={setCheckAds} label="Check Ad Library" />
              <Toggle value={skipNoFb} onChange={setSkipNoFb} label="Skip businesses with no Facebook" />
              <button onClick={() => startEnrich.mutate()} disabled={!file || startEnrich.isPending} className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {startEnrich.isPending ? "Starting…" : "Start Enrichment"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Enriched Results</h3>
            {results.length > 0 && <button className="text-xs text-primary hover:underline flex items-center gap-1"><Download className="w-3 h-3" /> Export CSV</button>}
          </div>
          {results.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">Upload a CSV and start enrichment to see results</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-left">
                    {["Name", "Facebook", "Website", "Total Ads", "Active Ads", "Status"].map((h) => (
                      <th key={h} className="px-3 py-2 text-xs text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-3 py-2 text-foreground">{r.name}</td>
                      <td className="px-3 py-2">{r.facebook_url ? <a href={r.facebook_url} target="_blank" className="text-primary hover:underline text-xs">Link</a> : <span className="text-muted-foreground text-xs">—</span>}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{r.website || "—"}</td>
                      <td className="px-3 py-2 text-foreground">{r.total_ads ?? 0}</td>
                      <td className="px-3 py-2 text-foreground">{r.active_ads ?? 0}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.active_ads > 0 ? "bg-success/10 text-success" : r.total_ads > 0 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                          {r.active_ads > 0 ? "Running Ads" : r.total_ads > 0 ? "Has Ads" : "No Ads"}
                        </span>
                      </td>
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

export default AdsScraper;