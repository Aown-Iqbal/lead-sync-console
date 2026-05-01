import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Users,
  Megaphone,
  MapPin,
  Search,
  Mic,
  Settings,
  FileText,
} from "lucide-react";

const sections = [
  {
    title: "OUTREACH",
    links: [
      { to: "/", label: "Leads", icon: Users },
      { to: "/campaigns", label: "Campaigns", icon: Megaphone, soon: true },
    ],
  },
  {
    title: "TOOLS",
    links: [
      { to: "/maps-scraper", label: "Maps Scraper", icon: MapPin },
      { to: "/ads-scraper", label: "Ads Scraper", icon: Search },
      { to: "/voice", label: "Voice Messages", icon: Mic },
    ],
  },
  {
    title: "SYSTEM",
    links: [
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/logs", label: "Logs", icon: FileText, soon: true },
    ],
  },
];

export function Sidebar() {
  const { data, isError } = useQuery({
    queryKey: ["status"],
    queryFn: api.status,
    refetchInterval: 5000,
    retry: false,
  });

  const running = !isError && data?.running;

  return (
    <aside className="w-[240px] shrink-0 h-screen border-r border-border bg-card flex flex-col fixed left-0 top-0 z-30">
      <div className="px-5 h-[60px] flex items-center border-b border-border">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Outreach<span className="text-muted-foreground font-normal">_OS</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {sections.map((s) => (
          <div key={s.title} className="mb-5">
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground">
              {s.title}
            </div>
            <div className="space-y-0.5">
              {s.links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-[13px] rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`
                  }
                >
                  <l.icon className="w-4 h-4" />
                  <span className="flex-1">{l.label}</span>
                  {l.soon && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                      Soon
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              running ? "bg-success animate-pulse" : "bg-danger"
            }`}
          />
          <span className="text-[11px] text-muted-foreground">
            {running ? "Bot Running" : "Bot Stopped"}
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">v0.1.0</span>
      </div>
    </aside>
  );
}