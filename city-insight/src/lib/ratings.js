export const RATING_KEYS = ["safety", "cost", "traffic", "cleanliness"];
export const DEFAULT_RATING = 6;

/** Clamp and coerce to an integer */
export function clampInt(value, lo, hi) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

/** Clamp to 1..10, return null if non-numeric (useful for display) */
export function clampRating10(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(1, Math.min(10, n));
}

/** Clamp to 1..10 always returning a number (useful for form state) */
export function clampRating10OrDefault(value, fallback = DEFAULT_RATING) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return clampInt(n, 1, 10);
}

export function avgFromCategories(ratings, keys = RATING_KEYS) {
  const vals = keys
    .map((k) => clampRating10(ratings?.[k]))
    .filter((v) => v != null);

  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function derivedOverall(ratings, keys = RATING_KEYS) {
  const vals = keys
    .map((k) => Number(ratings?.[k]))
    .filter((v) => Number.isFinite(v));

  if (vals.length === 0) return DEFAULT_RATING;

  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return clampInt(avg, 1, 10);
}

/** ReviewEditor form shape */
export function makeEmptyReviewForm(defaultRating = DEFAULT_RATING) {
  return {
    ratings: {
      safety: defaultRating,
      cost: defaultRating,
      traffic: defaultRating,
      cleanliness: defaultRating,
    },
    comment: "",
  };
}

/** Convert API review -> ReviewEditor form */
export function normalizeReviewToForm(review, defaultRating = DEFAULT_RATING) {
  return {
    ratings: {
      safety: clampRating10OrDefault(review?.ratings?.safety, defaultRating),
      cost: clampRating10OrDefault(review?.ratings?.cost, defaultRating),
      traffic: clampRating10OrDefault(review?.ratings?.traffic, defaultRating),
      cleanliness: clampRating10OrDefault(
        review?.ratings?.cleanliness,
        defaultRating,
      ),
    },
    comment: review?.comment ?? "",
  };
}
