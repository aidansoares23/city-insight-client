// Only allow internal, relative app routes.
// Helps prevent open redirects via router state.
export function safeReturnTo(value) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}
