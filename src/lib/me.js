import api from "@/services/api";

/** Updates the current user's profile (e.g. display name). */
export function updateMyProfile(payload) {
  return api.patch("/me", payload).then((r) => r.data);
}
