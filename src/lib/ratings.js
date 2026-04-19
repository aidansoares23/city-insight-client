export const RATING_KEYS = ["safety", "affordability", "walkability", "cleanliness"];
export const DEFAULT_RATING = 6;

export const RATING_LABELS = {
  safety: "Safety",
  affordability: "Affordability",
  walkability: "Walkability",
  cleanliness: "Cleanliness",
};

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
 * Good  ≥ 7  → --score-good (emerald)
 * Ok    ≥ 4  → --score-ok (amber)
 * Poor  < 4  → --score-bad (rose)
 *
 * Returns an object with Tailwind class strings for common contexts:
 *   pill   – filled pill (CityCard livability badge)
 *   badge  – light badge with border (ReviewCard overall block)
 *   bar    – solid fill for progress bars
 */
export function scoreColor(outOf10) {
  if (outOf10 == null) {
    return {
      pill:  "bg-[hsl(var(--score-neutral-subtle))] text-[hsl(var(--score-neutral))]",
      badge: "bg-[hsl(var(--score-neutral-subtle))] text-[hsl(var(--score-neutral))] border-[hsl(var(--score-neutral-subtle))]",
      bar:   "bg-[hsl(var(--score-neutral))]",
      halo:  "border-[hsl(var(--score-neutral))]",
    };
  }
  if (outOf10 >= 7) {
    return {
      pill:  "bg-[hsl(var(--score-good-subtle))] text-[hsl(var(--score-good))]",
      badge: "bg-[hsl(var(--score-good-subtle))] text-[hsl(var(--score-good))] border-[hsl(var(--score-good-subtle))]",
      bar:   "bg-[hsl(var(--score-good))]",
      halo:  "border-[hsl(var(--score-good))]",
    };
  }
  if (outOf10 >= 4) {
    return {
      pill:  "bg-[hsl(var(--score-ok-subtle))] text-[hsl(var(--score-ok))]",
      badge: "bg-[hsl(var(--score-ok-subtle))] text-[hsl(var(--score-ok))] border-[hsl(var(--score-ok-subtle))]",
      bar:   "bg-[hsl(var(--score-ok))]",
      halo:  "border-[hsl(var(--score-ok))]",
    };
  }
  return {
    pill:  "bg-[hsl(var(--score-bad-subtle))] text-[hsl(var(--score-bad))]",
    badge: "bg-[hsl(var(--score-bad-subtle))] text-[hsl(var(--score-bad))] border-[hsl(var(--score-bad-subtle))]",
    bar:   "bg-[hsl(var(--score-bad))]",
    halo:  "border-[hsl(var(--score-bad))]",
  };
}

/** Returns a qualitative label for a score out of 10: "Great", "Good", or "Fair". */
export function scoreLabel(outOf10) {
  if (outOf10 == null) return null;
  if (outOf10 >= 7) return "Great";
  if (outOf10 >= 4) return "Good";
  return "Fair";
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
