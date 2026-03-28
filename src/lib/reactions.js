import api from "@/services/api";

/** Adds or replaces the current user's reaction on a review. */
export function upsertReaction(citySlug, reviewId, type) {
  if (!citySlug || !reviewId || !type) throw new Error("upsertReaction: missing params");
  return api.put(`/cities/${citySlug}/reviews/${reviewId}/reactions/${type}`);
}

/** Removes the current user's reaction from a review. */
export function deleteReaction(citySlug, reviewId) {
  if (!citySlug || !reviewId) throw new Error("deleteReaction: missing params");
  return api.delete(`/cities/${citySlug}/reviews/${reviewId}/reactions`);
}
