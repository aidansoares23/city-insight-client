export const RATING_KEYS = ["safety", "affordability", "walkability", "cleanliness"];
export const DEFAULT_RATING = 6;

/** Clamp and coerce to an integer */
export function clampInt(value, lo, hi) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

/** Clamp to 1..10, return null if non-numeric (useful for display) */
export function clampRating10(value) {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(1, Math.min(10, n));
}

/** Clamp to 1..10 always returning a number (useful for form state) */
export function clampRating10OrDefault(value, fallback = DEFAULT_RATING) {
  if (value == null) return fallback;
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

/**
 * Shared 3-tier color tokens for any score out of 10.
 * Good  ≥ 7  → emerald
 * Ok    ≥ 4  → amber
 * Poor  < 4  → rose
 *
 * Returns an object with Tailwind class strings for common contexts:
 *   pill   – filled pill (CityCard livability badge)
 *   badge  – light badge with border (ReviewCard overall block)
 */
export function scoreColor(outOf10) {
  if (outOf10 == null) {
    return {
      pill:  "bg-slate-100 text-slate-700",
      badge: "bg-slate-100 text-slate-500 border-slate-200",
    };
  }
  if (outOf10 >= 7) {
    return {
      pill:  "bg-emerald-100 text-emerald-800",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (outOf10 >= 4) {
    return {
      pill:  "bg-amber-100 text-amber-800",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  return {
    pill:  "bg-rose-100 text-rose-800",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  };
}

/** ReviewEditor form shape */
export function makeEmptyReviewForm(defaultRating = DEFAULT_RATING) {
  return {
    ratings: {
      safety: defaultRating,
      affordability: defaultRating,
      walkability: defaultRating,
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
      affordability: clampRating10OrDefault(review?.ratings?.affordability, defaultRating),
      walkability: clampRating10OrDefault(review?.ratings?.walkability, defaultRating),
      cleanliness: clampRating10OrDefault(
        review?.ratings?.cleanliness,
        defaultRating,
      ),
    },
    comment: review?.comment ?? "",
  };
}
