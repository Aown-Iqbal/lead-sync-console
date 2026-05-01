import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Download, Plus, Loader2 } from "lucide-react";

const MapsScraper = () => {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Lahore");
  const [filterJunk, setFilterJunk] = useState(true);
  const [skipNoPhone, setSkipNoPhone] = useState(true);
  const [maxResults, setMaxResults] = useState(50);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const { data: jobs = [] } = useQuery({
    queryKey: ["scraper-jobs"],
    queryFn: api.scraperJobs,
    refetchInterval: 5000,
  }) as { data: any[] };

  const { data: results = [] } = useQuery({
    queryKey: ["scraper-results", selectedJob],
    queryFn: () => api.scraperResults(selectedJob!),
    enabled: !!selectedJob,
  }) as { data: any[] };

  const startScrape = useMutation({
    mutationFn: () => api.scraperStart({ query, city, filter_junk: filterJunk, skip_no_phone: skipNoPhone, max_results: maxResults }),
    onSuccess: (data: any) => {
      toast.success("Scrape job started");
      setSelectedJob(data?.id || null);
      qc.invalidateQueries({ queryKey: ["scraper-jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeJob = jobs.find((j: any) => j.status === "running");

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-foreground mb-6">Google Maps Scraper</h1>
      <div className="grid grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">New Scrape Job</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Search Query</label>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="dental clinics in Lahore" className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-foreground">Filter junk websites</span>
                <button onClick={() => setFilterJunk(!filterJunk)} className={`w-9 h-5 rounded-full transition-colors ${filterJunk ? "bg-primary" : "bg-muted"} relative`}>
                  <span className={`block w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${filterJunk ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-foreground">Skip leads with no phone</span>
                <button onClick={() => setSkipNoPhone(!skipNoPhone)} className={`w-9 h-5 rounded-full transition-colors ${skipNoPhone ? "bg-primary" : "bg-muted"} relative`}>
                  <span className={`block w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${skipNoPhone ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Max results</label>
                <input type="number" value={maxResults} onChange={(e) => setMaxResults(Number(e.target.value))} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <button onClick={() => startScrape.mutate()} disabled={startScrape.isPending || !query.trim()} className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {startScrape.isPending ? "Starting…" : "Start Scraping"}
              </button>
            </div>
          </div>

          {activeJob && (
            <div className="bg-card border border-primary/20 rounded-lg p-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-foreground">Scraping in progress… {activeJob.result_count ?? 0} results so far</span>
            </div>
          )}

          {jobs.length > 0 && (
            <div className="bg-card border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">Recent Jobs</h3>
              </div>
              <div className="divide-y divide-border">
                {jobs.map((j: any) => (
                  <div key={j.id} onClick={() => setSelectedJob(j.id)} className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${selectedJob === j.id ? "bg-muted/50" : ""}`}>
                    <div>
                      <div className="text-sm text-foreground">{j.filename || j.query}</div>
                      <div className="text-xs text-muted-foreground">{j.result_count} rows · {j.date || ""}</div>
                    </div>
                    <button className="text-xs text-primary hover:underline flex items-center gap-1"><Download className="w-3 h-3" /> CSV</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Results Preview</h3>
            {results.length > 0 && (
              <button className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add All to Leads
              </button>
            )}
          </div>
          {results.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">Select a job or run a scrape to see results</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-left">
                    {["Name", "Phone", "Address", "Rating", "Reviews"].map((h) => (
                      <th key={h} className="px-3 py-2 text-xs text-muted-foreground font-medium">{h}</th>
                    ))}
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-3 py-2 text-foreground">{r.name}</td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{r.phone}</td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">{r.address}</td>
                      <td className="px-3 py-2 text-foreground">{r.rating}</td>
                      <td className="px-3 py-2 text-foreground">{r.review_count}</td>
                      <td className="px-3 py-2"><button className="text-xs text-primary hover:underline">Add to Leads</button></td>
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

export default MapsScraper;