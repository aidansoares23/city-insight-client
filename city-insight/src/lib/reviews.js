import api from "@/services/api";

// nextCursor shape from API: { id: string, createdAt: ISO string }
export function buildReviewsQuery({ pageSize = 10, cursor } = {}) {
  const qs = new URLSearchParams({ pageSize: String(pageSize) });

  if (cursor?.id) qs.set("id", cursor.id);
  if (cursor?.createdAt) qs.set("createdAt", cursor.createdAt);

  return qs.toString();
}

export function fetchMyReviews({ limit = 50 } = {}) {
  return api
    .get(`/me/reviews?limit=${limit}`)
    .then((res) => res.data?.reviews || []);
}

export function fetchMyReview(citySlug) {
  if (!citySlug) throw new Error("fetchMyReview: missing citySlug");
  return api
    .get(`/cities/${citySlug}/reviews/me`)
    .then((res) => res.data?.review ?? null);
}

export function upsertMyReview(citySlug, payload) {
  if (!citySlug) throw new Error("upsertMyReview: missing citySlug");
  return api.post(`/cities/${citySlug}/reviews`, payload);
}

export function deleteMyReview(citySlug) {
  if (!citySlug) throw new Error("deleteMyReview: missing citySlug");
  return api.delete(`/cities/${citySlug}/reviews/me`);
}

export function deleteMyAccount() {
  return api.delete("/me");
}
