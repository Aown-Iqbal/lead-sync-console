import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const links = [
  { to: "/", label: "Leads" },
  { to: "/settings", label: "Settings" },
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
    <aside className="w-[220px] shrink-0 h-screen border-r border-border bg-surface flex flex-col fixed left-0 top-0">
      <div className="px-5 h-14 flex items-center border-b border-border">
        <span className="font-mono text-[13px] tracking-tight text-foreground font-semibold">
          Outreach<span className="text-muted-foreground">_OS</span>
        </span>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `block px-3 py-1.5 text-[13px] rounded-sm transition-colors ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              running ? "bg-success" : "bg-danger"
            } ${running ? "animate-pulse" : ""}`}
          />
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            {running ? "Bot Running" : "Bot Stopped"}
          </span>
        </div>
      </div>
    </aside>
  );
}