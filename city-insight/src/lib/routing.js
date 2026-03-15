/**
 * Validates a return-to URL, allowing only internal relative app routes.
 * Rejects non-strings, absolute URLs, and protocol-relative URLs (`//`)
 * to prevent open-redirect attacks via router state.
 * @param {unknown} value
 * @returns {string|null}
 */
export function safeReturnTo(value) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}
