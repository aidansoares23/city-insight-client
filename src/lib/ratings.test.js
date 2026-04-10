import { describe, it, expect } from "vitest";
import {
  clampInt,
  clampRating10,
  clampRating10OrDefault,
  avgFromCategories,
  derivedOverall,
  scoreColor,
  scoreLabel,
  makeEmptyReviewForm,
  normalizeReviewToForm,
  DEFAULT_RATING,
  RATING_KEYS,
} from "./ratings";

describe("clampInt", () => {
  it("returns value within range unchanged", () => {
    expect(clampInt(5, 1, 10)).toBe(5);
  });
  it("clamps below min", () => {
    expect(clampInt(0, 1, 10)).toBe(1);
    expect(clampInt(-5, 1, 10)).toBe(1);
  });
  it("clamps above max", () => {
    expect(clampInt(15, 1, 10)).toBe(10);
  });
  it("rounds to nearest integer", () => {
    expect(clampInt(3.7, 1, 10)).toBe(4);
    expect(clampInt(3.2, 1, 10)).toBe(3);
  });
  it("returns lo for non-numeric input", () => {
    expect(clampInt("abc", 1, 10)).toBe(1);
    expect(clampInt(null, 1, 10)).toBe(1);
    expect(clampInt(undefined, 1, 10)).toBe(1);
  });
});

describe("clampRating10", () => {
  it("returns in-range values unchanged", () => {
    expect(clampRating10(1)).toBe(1);
    expect(clampRating10(5)).toBe(5);
    expect(clampRating10(10)).toBe(10);
  });
  it("clamps below 1", () => {
    expect(clampRating10(0)).toBe(1);
    expect(clampRating10(-5)).toBe(1);
  });
  it("clamps above 10", () => {
    expect(clampRating10(11)).toBe(10);
    expect(clampRating10(100)).toBe(10);
  });
  it("returns null for null, undefined, and non-numeric input", () => {
    expect(clampRating10(null)).toBe(null);
    expect(clampRating10(undefined)).toBe(null);
    expect(clampRating10("abc")).toBe(null);
  });
  it("clamps empty string to 1 — Number('')==0 is finite and not null", () => {
    expect(clampRating10("")).toBe(1);
  });
  it("accepts numeric strings", () => {
    expect(clampRating10("7")).toBe(7);
  });
});

describe("clampRating10OrDefault", () => {
  it("returns in-range values unchanged", () => {
    expect(clampRating10OrDefault(5)).toBe(5);
  });
  it("returns fallback for null, undefined, and non-numeric strings", () => {
    expect(clampRating10OrDefault(null)).toBe(DEFAULT_RATING);
    expect(clampRating10OrDefault(undefined)).toBe(DEFAULT_RATING);
    expect(clampRating10OrDefault("abc")).toBe(DEFAULT_RATING);
    expect(clampRating10OrDefault("abc", 3)).toBe(3);
  });
  it("clamps out-of-range values", () => {
    expect(clampRating10OrDefault(0)).toBe(1);
    expect(clampRating10OrDefault(15)).toBe(10);
  });
});

describe("avgFromCategories", () => {
  it("averages all four rating keys", () => {
    const ratings = { safety: 8, affordability: 6, walkability: 4, cleanliness: 6 };
    expect(avgFromCategories(ratings)).toBe(6);
  });
  it("returns null when ratings is null or empty", () => {
    expect(avgFromCategories(null)).toBe(null);
    expect(avgFromCategories({})).toBe(null);
    expect(avgFromCategories(undefined)).toBe(null);
  });
  it("skips null rating values (treated as missing, not as 0)", () => {
    const ratings = { safety: 8, affordability: null, walkability: 4, cleanliness: null };
    expect(avgFromCategories(ratings)).toBe(6); // (8+4)/2
  });
  it("skips undefined and NaN values (truly non-numeric)", () => {
    const ratings = { safety: 8, affordability: undefined, walkability: 4, cleanliness: undefined };
    expect(avgFromCategories(ratings)).toBe(6); // (8+4)/2
  });
});

describe("derivedOverall", () => {
  it("averages all category ratings and rounds", () => {
    const ratings = { safety: 8, affordability: 6, walkability: 4, cleanliness: 6 };
    expect(derivedOverall(ratings)).toBe(6);
  });
  it("returns DEFAULT_RATING when no valid ratings exist", () => {
    expect(derivedOverall({})).toBe(DEFAULT_RATING);
    expect(derivedOverall(null)).toBe(DEFAULT_RATING);
  });
  it("clamps result to 1-10", () => {
    const all10 = { safety: 10, affordability: 10, walkability: 10, cleanliness: 10 };
    expect(derivedOverall(all10)).toBe(10);
  });
});

describe("scoreColor", () => {
  it("returns neutral classes for null", () => {
    const result = scoreColor(null);
    expect(result.pill).toContain("score-neutral");
    expect(result.badge).toContain("score-neutral");
  });
  it("returns good classes for score >= 7", () => {
    expect(scoreColor(7).pill).toContain("score-good");
    expect(scoreColor(10).pill).toContain("score-good");
  });
  it("returns ok classes for score >= 4 and < 7", () => {
    expect(scoreColor(4).pill).toContain("score-ok");
    expect(scoreColor(6).pill).toContain("score-ok");
  });
  it("returns bad classes for score < 4", () => {
    expect(scoreColor(3).pill).toContain("score-bad");
    expect(scoreColor(0).pill).toContain("score-bad");
  });
  it("returns both pill and badge keys", () => {
    const result = scoreColor(8);
    expect(result).toHaveProperty("pill");
    expect(result).toHaveProperty("badge");
  });
  it("returns a bar key in every tier", () => {
    expect(scoreColor(8)).toHaveProperty("bar");
    expect(scoreColor(5)).toHaveProperty("bar");
    expect(scoreColor(2)).toHaveProperty("bar");
    expect(scoreColor(null)).toHaveProperty("bar");
  });
});

describe("scoreLabel", () => {
  it("returns Great for score >= 7", () => {
    expect(scoreLabel(7)).toBe("Great");
    expect(scoreLabel(10)).toBe("Great");
  });
  it("returns Good for score >= 4 and < 7", () => {
    expect(scoreLabel(4)).toBe("Good");
    expect(scoreLabel(6.9)).toBe("Good");
  });
  it("returns Fair for score < 4", () => {
    expect(scoreLabel(3)).toBe("Fair");
    expect(scoreLabel(0)).toBe("Fair");
  });
  it("returns null for null input", () => {
    expect(scoreLabel(null)).toBeNull();
  });
});

describe("makeEmptyReviewForm", () => {
  it("sets all rating keys to DEFAULT_RATING", () => {
    const form = makeEmptyReviewForm();
    for (const key of RATING_KEYS) {
      expect(form.ratings[key]).toBe(DEFAULT_RATING);
    }
  });
  it("sets comment to empty string", () => {
    expect(makeEmptyReviewForm().comment).toBe("");
  });
  it("accepts a custom default rating", () => {
    const form = makeEmptyReviewForm(3);
    for (const key of RATING_KEYS) {
      expect(form.ratings[key]).toBe(3);
    }
  });
});

describe("normalizeReviewToForm", () => {
  it("converts a valid API review to form shape", () => {
    const review = {
      ratings: { safety: 8, affordability: 6, walkability: 4, cleanliness: 7 },
      comment: "Great city",
    };
    const form = normalizeReviewToForm(review);
    expect(form.ratings.safety).toBe(8);
    expect(form.ratings.affordability).toBe(6);
    expect(form.ratings.walkability).toBe(4);
    expect(form.ratings.cleanliness).toBe(7);
    expect(form.comment).toBe("Great city");
  });
  it("uses DEFAULT_RATING for undefined or non-numeric string fields", () => {
    const form = normalizeReviewToForm({ ratings: { safety: "bad" } });
    expect(form.ratings.safety).toBe(DEFAULT_RATING);
    expect(form.ratings.walkability).toBe(DEFAULT_RATING);
  });
  it("falls back to empty string for null comment", () => {
    const form = normalizeReviewToForm({ ratings: {}, comment: null });
    expect(form.comment).toBe("");
  });
  it("handles null review gracefully", () => {
    const form = normalizeReviewToForm(null);
    expect(form.comment).toBe("");
    for (const key of RATING_KEYS) {
      expect(form.ratings[key]).toBe(DEFAULT_RATING);
    }
  });
});
