import type { Employee } from "./types";

export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const fmtDateTime = (d: Date | string) =>
  new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export const daysBetween = (a: Date, b: Date) =>
  Math.round((+new Date(b) - +new Date(a)) / 864e5) + 1;

export const short = (n: number) =>
  n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "K" : String(n);

export const initials = (e: Employee) => (e.first[0] + e.last[0]).toUpperCase();
export const fullName = (e?: Employee | null) => (e ? `${e.first} ${e.last}` : "—");

export const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

/** Currency formatter bound to the company setting. */
export function makeMoney(currency: "PKR" | "USD") {
  const symbol = currency === "PKR" ? "₨ " : "$ ";
  return (n: number) => symbol + Math.round(n).toLocaleString("en-US");
}
