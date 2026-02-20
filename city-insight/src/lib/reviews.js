import api from "@/services/api";

// Cursor pagination query builder for GET /api/cities/:slug/reviews
export function buildReviewsQuery({ pageSize = 10, cursor } = {}) {
  const qs = new URLSearchParams({ pageSize: String(pageSize) });

  if (cursor?.id) qs.set("cursorId", cursor.id);
  if (cursor?.createdAtIso) qs.set("cursorCreatedAtIso", cursor.createdAtIso);

  return qs.toString();
}

// GET current user's reviews (Account page)
export function fetchMyReviews({ limit = 50 } = {}) {
  return api
    .get(`/me/reviews?limit=${limit}`)
    .then((res) => res.data?.reviews || []);
}

// GET my review for a city (ReviewEditor / CityDetail)
export function fetchMyReview(citySlug) {
  if (!citySlug) throw new Error("fetchMyReview: missing citySlug");
  return api
    .get(`/cities/${citySlug}/reviews/me`)
    .then((res) => res.data?.review ?? null);
}

// POST create/update my review for a city
export function upsertMyReview(citySlug, payload) {
  if (!citySlug) throw new Error("upsertMyReview: missing citySlug");
  return api.post(`/cities/${citySlug}/reviews`, payload);
}

// DELETE my review for a city
export function deleteMyReview(citySlug) {
  if (!citySlug) throw new Error("deleteMyReview: missing citySlug");
  return api.delete(`/cities/${citySlug}/reviews/me`);
}
