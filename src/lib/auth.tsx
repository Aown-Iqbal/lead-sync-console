import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthCtx {
  user: { email: string; name: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthCtx["user"]>(() => {
    const s = localStorage.getItem("outreach_user");
    return s ? JSON.parse(s) : null;
  });

  const login = (email: string, password: string) => {
    if (email === "admin@outreach.os" && password === "password") {
      const u = { email, name: "Admin" };
      localStorage.setItem("outreach_user", JSON.stringify(u));
      setUser(u);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("outreach_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);