/**
 * Strips ASCII control characters (0x00–0x1F, 0x7F) from a string.
 * Mirrors aiController.js: rawQuery.replace(/[\x00-\x1F\x7F]/g, "")
 * @param {string} value
 * @returns {string}
 */
export function stripControlChars(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\x00-\x1F\x7F]/g, "");
}

/**
 * Sanitizes an AI query: trim → strip control chars → cap at 1000 chars.
 * Returns "" if the result is empty (caller should block submission).
 * Mirrors validation in aiController.js lines 416–427.
 * @param {string} value
 * @returns {string}
 */
export function sanitizeAiQuery(value) {
  if (typeof value !== "string") return "";
  return stripControlChars(value.trim()).slice(0, 1000);
}

/**
 * Validates a display name against backend rules (meService.js lines 190–194):
 *   trim, then must be 1–50 characters.
 * Returns { ok: true, value } or { ok: false, error }.
 * Error string matches backend verbatim.
 * @param {string} value
 * @returns {{ ok: true, value: string } | { ok: false, error: string }}
 */
export function sanitizeDisplayName(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (trimmed.length === 0 || trimmed.length > 50)
    return { ok: false, error: "Display name must be 1–50 characters" };
  return { ok: true, value: trimmed };
}
