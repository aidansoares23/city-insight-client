// Normalizes common timestamp shapes into a JS Date (or null).
// Supports:
// - Firestore Timestamp (value.toDate())
// - Firestore-like { _seconds } or { seconds }
// - Date
// - ISO string / epoch ms
export function toDate(value) {
  if (value == null) return null;

  // Firestore Timestamp object
  if (typeof value?.toDate === "function") {
    const dt = value.toDate();
    return Number.isFinite(dt?.getTime?.()) ? dt : null;
  }

  // Firestore-like objects
  const seconds =
    typeof value?._seconds === "number"
      ? value._seconds
      : typeof value?.seconds === "number"
        ? value.seconds
        : null;

  if (seconds != null) {
    const dt = new Date(seconds * 1000);
    return Number.isFinite(dt.getTime()) ? dt : null;
  }

  // Date / string / number
  const dt = value instanceof Date ? value : new Date(value);
  return Number.isFinite(dt.getTime()) ? dt : null;
}

export function fmtDateTime(value, opts) {
  const dt = toDate(value);
  if (!dt) return "—";
  return dt.toLocaleString(
    undefined,
    opts ?? { dateStyle: "medium", timeStyle: "short" },
  );
}

export function fmtDate(value, opts) {
  const dt = toDate(value);
  if (!dt) return "—";
  return dt.toLocaleString(undefined, opts ?? { dateStyle: "medium" });
}
