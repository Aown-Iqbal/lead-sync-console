import { Sun, Moon, ChevronDown, LogOut, User } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const pageTitles: Record<string, string> = {
  "/": "Leads",
  "/settings": "Settings",
  "/maps-scraper": "Maps Scraper",
  "/ads-scraper": "Ads Scraper",
  "/voice": "Voice Messages",
  "/campaigns": "Campaigns",
  "/logs": "Logs",
};

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[location.pathname] || "";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-[60px] border-b border-border bg-card flex items-center px-6 sticky top-0 z-20">
      <div className="flex-1" />
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      <div className="flex-1 flex items-center justify-end gap-3">
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
              {user?.name?.[0] || "A"}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-border">
                <div className="text-sm font-medium text-foreground">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
              <button
                onClick={() => { setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}