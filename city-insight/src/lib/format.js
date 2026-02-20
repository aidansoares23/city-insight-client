export function fmtMoney(value) {
  if (value == null) return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toLocaleString()}` : "—";
}

export function fmtNum(value, { digits = 0 } = {}) {
  if (value == null) return "—";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(digits) : "—";
}

export function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function safeNumOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Interprets input as 0–100 and converts to 0.0–10.0 (1 decimal)
export function toOutOf10(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const out = n / 10;
  return Math.round(out * 10) / 10;
}

export function initialsFromUser(user) {
  const name = user?.displayName || user?.email || "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  const initials = (first + last).toUpperCase();
  return initials || "U";
}
