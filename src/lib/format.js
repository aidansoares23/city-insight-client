/** Formats a number as a locale-aware dollar string (e.g. `$1,234`); returns `"N/A"` for null/non-finite. */
export function fmtMoney(value) {
  if (value == null) return "N/A";
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toLocaleString()}` : "N/A";
}

/** Formats a number to a fixed number of decimal places; returns `"N/A"` for null/non-finite. */
export function fmtNum(value, { digits = 0 } = {}) {
  if (value == null) return "N/A";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(digits) : "N/A";
}

/** Clamps a value to [0, 1]; returns 0 for non-finite input. */
export function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/** Converts a value to a number, returning null if the result is non-finite. */
export function safeNumOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Converts a 0–100 value to a 0.0–10.0 score (1 decimal place); returns null for non-finite input. */
export function toOutOf10(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const out = n / 10;
  return Math.round(out * 10) / 10;
}

/** Formats a numeric value as `"X.X/10"`, or `"N/A"` if null/non-finite. */
export function fmtOutOf10(value) {
  const parsed = safeNumOrNull(value);
  return parsed == null ? "N/A" : `${parsed.toFixed(1)}/10`;
}

/** Formats a population number compactly (e.g. 1,234,567 → "1.2M", 234567 → "235K"); returns `"N/A"` for null/non-finite. */
export function fmtPop(value) {
  if (value == null) return "N/A";
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

/** Extracts 1–2 uppercase initials from a user's displayName or email for avatar fallback; returns `"U"` if empty. */
export function initialsFromUser(user) {
  const name = user?.displayName || user?.email || "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  const initials = (first + last).toUpperCase();
  return initials || "U";
}
