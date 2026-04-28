const BASE = "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export type LeadStatus = "active" | "pending" | "human_needed" | "done";
export type LeadMode = "ai" | "human";

export interface Lead {
  phone: string;
  business_name: string;
  status: LeadStatus;
  mode: LeadMode;
  last_message?: string;
  last_active?: string;
}

export interface Stats {
  total: number;
  active: number;
  pending: number;
  human_needed: number;
}

export interface Message {
  id?: string;
  direction: "inbound" | "outbound";
  sender?: "ai" | "human" | "lead";
  text: string;
  timestamp: string;
}

export interface BotStatus {
  running: boolean;
}

export interface SettingsData {
  batch_hours: string[];
  batch_size: number;
}

export const api = {
  status: () => req<BotStatus>("/status"),
  stats: () => req<Stats>("/stats"),
  leads: () => req<Lead[]>("/leads"),
  conversation: (phone: string) =>
    req<Message[]>(`/leads/${encodeURIComponent(phone)}/conversation`),
  setMode: (phone: string, mode: LeadMode) =>
    req<void>(`/leads/${encodeURIComponent(phone)}/mode`, {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),
  send: (phone: string, text: string) =>
    req<void>(`/leads/${encodeURIComponent(phone)}/send`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  settings: () => req<SettingsData>("/settings"),
  clearAll: () => req<void>("/leads/all", { method: "DELETE" }),
};

export function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "—";
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function truncate(s: string | undefined, n = 60): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}