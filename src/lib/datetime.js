/**
 * Coerces a value to a native `Date`.
 * Accepts a Firestore `Timestamp`, a Firestore-like `{ seconds }` / `{ _seconds }` object,
 * a native `Date`, an ISO string, or a numeric epoch. Returns `null` for anything invalid.
 * @param {unknown} value
 * @returns {Date|null}
 */
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

/** Formats a date-time value as a locale string; defaults to medium date + short time. Returns `"N/A"` if invalid. */
export function fmtDateTime(value, opts) {
  const dt = toDate(value);
  if (!dt) return "N/A";
  return dt.toLocaleString(
    undefined,
    opts ?? { dateStyle: "medium", timeStyle: "short" },
  );
}

/** Formats a date value as a locale date-only string; defaults to medium date style. Returns `"N/A"` if invalid. */
export function fmtDate(value, opts) {
  const dt = toDate(value);
  if (!dt) return "N/A";
  return dt.toLocaleString(undefined, opts ?? { dateStyle: "medium" });
}
