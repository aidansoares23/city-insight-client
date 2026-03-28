import api from "@/services/api";

/** Returns the current user's favorited cities. */
export function fetchMyFavorites() {
  return api.get("/me/favorites").then((res) => res.data?.favorites || []);
}

/** Adds a city to the current user's favorites. */
export function addFavorite(citySlug) {
  if (!citySlug) throw new Error("addFavorite: missing citySlug");
  return api.put(`/me/favorites/${citySlug}`);
}

/** Removes a city from the current user's favorites. */
export function removeFavorite(citySlug) {
  if (!citySlug) throw new Error("removeFavorite: missing citySlug");
  return api.delete(`/me/favorites/${citySlug}`);
}
