import { prettyCityFromSlug } from "@/lib/cities";

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

const STATIC_LABELS = {
  "/": "the home page",
  "/account": "your account page",
  "/cities": "the cities list",
  "/compare": "the city comparison tool",
  "/quiz": "the city quiz",
  "/ask": "the AI city explorer",
  "/methodology": "the methodology page",
  "/privacy": "the privacy policy",
  "/terms": "the terms of service",
};

/**
 * Converts a return-to path into a human-readable destination label.
 * Falls back to the raw path if no friendly name is known.
 * @param {string} path
 * @returns {string}
 */
export function friendlyReturnTo(path) {
  if (!path) return "your destination";

  if (STATIC_LABELS[path]) return STATIC_LABELS[path];

  // /cities/:slug/review
  const reviewMatch = path.match(/^\/cities\/([^/]+)\/review$/);
  if (reviewMatch) {
    return `your review for ${prettyCityFromSlug(reviewMatch[1])}`;
  }

  // /cities/:slug
  const cityMatch = path.match(/^\/cities\/([^/]+)$/);
  if (cityMatch) {
    return prettyCityFromSlug(cityMatch[1]);
  }

  return path;
}
