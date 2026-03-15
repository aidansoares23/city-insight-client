import api from "@/services/api";

/**
 * Builds a URL query string for the paginated reviews endpoint.
 * Pass `cursor` (shape `{ id, createdAt }` from the previous page's `nextCursor`)
 * to fetch the next page.
 * @param {{ pageSize?: number, cursor?: { id: string, createdAt: string } }} [options]
 * @returns {string} query string without a leading `?`
 */
export function buildReviewsQuery({ pageSize = 10, cursor } = {}) {
  const qs = new URLSearchParams({ pageSize: String(pageSize) });

  if (cursor?.id) qs.set("id", cursor.id);
  if (cursor?.createdAt) qs.set("createdAt", cursor.createdAt);

  return qs.toString();
}

/** Fetches the current user's reviews, up to `limit` items. Returns an array of review objects. */
export function fetchMyReviews({ limit = 50 } = {}) {
  return api
    .get(`/me/reviews?limit=${limit}`)
    .then((res) => res.data?.reviews || []);
}

/** Fetches the current user's review for a specific city; returns `null` if none exists. */
export function fetchMyReview(citySlug) {
  if (!citySlug) throw new Error("fetchMyReview: missing citySlug");
  return api
    .get(`/cities/${citySlug}/reviews/me`)
    .then((res) => res.data?.review ?? null);
}

/** Creates or updates the current user's review for a city with the given payload. */
export function upsertMyReview(citySlug, payload) {
  if (!citySlug) throw new Error("upsertMyReview: missing citySlug");
  return api.post(`/cities/${citySlug}/reviews`, payload);
}

/** Deletes the current user's review for a city. */
export function deleteMyReview(citySlug) {
  if (!citySlug) throw new Error("deleteMyReview: missing citySlug");
  return api.delete(`/cities/${citySlug}/reviews/me`);
}

/** Permanently deletes the current user's account and all associated data. */
export function deleteMyAccount() {
  return api.delete("/me");
}
