import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";

import { Button } from "../components/ui/button";
import PageHero from "@/components/layout/PageHero";
import { BackLink } from "@/components/ui/back-link";
import SectionCard from "@/components/layout/SectionCard";
import { usePageTitle } from "@/hooks/usePageTitle";

import {
  MessageSquareText,
  Save,
  Trash2,
  X,
  SlidersHorizontal,
} from "lucide-react";

// ✅ extracted libs
import { safeReturnTo } from "@/lib/routing";
import { prettyCityFromSlug } from "@/lib/cities";
import {
  clampRating10,
  derivedOverall,
  makeEmptyReviewForm,
  normalizeReviewToForm,
} from "@/lib/ratings";
import { fetchMyReview, upsertMyReview, deleteMyReview } from "@/lib/reviews";

// -----------------------------
// Constants (page-level)
// -----------------------------
const RATING_KEYS = ["safety", "cost", "traffic", "cleanliness"];

const RATING_LABELS = {
  safety: "Safety",
  cost: "Cost",
  traffic: "Traffic",
  cleanliness: "Cleanliness",
};

const COMMENT_MAX = 800;

/**
 * One slider row.
 * (Removed the extra “progress hint” bar to avoid the double-bar look.)
 */
function RatingRow({ label, value, onChange }) {
  const safeV = Number.isFinite(Number(value)) ? Number(value) : 0;

  return (
    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[160px_1fr_72px] sm:gap-4">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <input
        className="w-full accent-[hsl(var(--primary))]"
        type="range"
        min="1"
        max="10"
        step="1"
        value={safeV}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} rating`}
      />

      <div className="text-right text-sm font-semibold text-slate-900 tabular-nums">
        {safeV}/10
      </div>
    </div>
  );
}

export default function ReviewEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // Prefer router-state returnTo; fallback to city page
  const returnTo = useMemo(() => {
    const fromState = safeReturnTo(location.state?.returnTo);
    return fromState || (slug ? `/cities/${slug}` : "/cities");
  }, [location.state, slug]);

  const cityLabel = useMemo(() => prettyCityFromSlug(slug), [slug]);

  // create | edit
  const [mode, setMode] = useState("create");

  const [form, setForm] = useState(() => makeEmptyReviewForm());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageTitle =
    authLoading || isLoading
      ? "Review"
      : `${mode === "edit" ? "Edit Review" : "Write Review"} — ${cityLabel}`;

  usePageTitle(pageTitle);

  // -----------------------------
  // Load my review (if any)
  // -----------------------------
  useEffect(() => {
    if (authLoading) return;
    if (!slug) return;

    // If signed out, show create mode with empty form
    if (!user) {
      setMode("create");
      setForm(makeEmptyReviewForm());
      setIsLoading(false);
      setErrorMsg("");
      return;
    }

    let alive = true;
    setIsLoading(true);
    setErrorMsg("");

    fetchMyReview(slug)
      .then((review) => {
        if (!alive) return;

        if (!review) {
          setMode("create");
          setForm(makeEmptyReviewForm());
          return;
        }

        setMode("edit");
        setForm(normalizeReviewToForm(review));
      })
      .catch((e) => {
        if (!alive) return;
        setErrorMsg(
          e?.response?.data?.error?.message || "Failed to load your review.",
        );
      })
      .finally(() => {
        if (!alive) return;
        setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user, slug, authLoading]);

  // -----------------------------
  // Form setters
  // -----------------------------
  const setRating = useCallback((key, value) => {
    setForm((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [key]: clampRating10(value),
      },
    }));
  }, []);

  const setComment = useCallback((value) => {
    setForm((prev) => ({ ...prev, comment: value }));
  }, []);

  // -----------------------------
  // Submit / delete
  // -----------------------------
  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!slug) return;

      setIsSaving(true);
      setErrorMsg("");

      try {
        const payload = {
          ratings: {
            ...form.ratings,
            overall: derivedOverall(form.ratings), // ✅ shared logic
          },
          comment: form.comment?.trim() ? form.comment.trim() : null,
        };

        const res = await upsertMyReview(slug, payload);
        const created = !!res?.data?.created;

        navigate(returnTo, {
          replace: true,
          state: { reviewSaved: true, created, citySlug: slug },
        });
      } catch (e2) {
        setErrorMsg(
          e2?.response?.data?.error?.message || "Failed to save review.",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [slug, form, navigate, returnTo],
  );

  const onDelete = useCallback(async () => {
    if (!slug) return;
    if (mode !== "edit") return;

    const ok = window.confirm("Delete your review? This cannot be undone.");
    if (!ok) return;

    setIsDeleting(true);
    setErrorMsg("");

    try {
      await deleteMyReview(slug);

      navigate(returnTo, {
        replace: true,
        state: { reviewDeleted: true, citySlug: slug },
      });
    } catch (e2) {
      setErrorMsg(
        e2?.response?.data?.error?.message || "Failed to delete review.",
      );
    } finally {
      setIsDeleting(false);
    }
  }, [slug, mode, navigate, returnTo]);

  // -----------------------------
  // Render gates
  // -----------------------------
  if (authLoading || isLoading) {
    return <div className="text-sm text-slate-600">Loading…</div>;
  }

  const headerTitle =
    mode === "edit"
      ? `Edit Review — ${cityLabel}`
      : `Write Review — ${cityLabel}`;

  const isBusy = isSaving || isDeleting;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <BackLink onClick={() => navigate(returnTo)}>Back</BackLink>
      </div>

      <PageHero
        title={headerTitle}
        description="Update your ratings and comment."
        aside={
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            Ratings (1–10)
          </div>
        }
      />

      {errorMsg ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMsg}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5">
        <SectionCard
          icon={MessageSquareText}
          title="Your Ratings"
          subtitle="Rate each category from 1–10."
          action={
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {mode === "edit" ? "Editing" : "New review"}
            </span>
          }
        >
          <div className="space-y-6">
            {/* Sliders */}
            <div className="space-y-4">
              {RATING_KEYS.map((k) => (
                <RatingRow
                  key={k}
                  label={RATING_LABELS[k] ?? k}
                  value={form.ratings[k]}
                  onChange={(v) => setRating(k, v)}
                />
              ))}
            </div>

            <div className="h-px bg-slate-100" />

            {/* Comments */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Additional Comments (Optional)
              </label>

              <textarea
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                value={form.comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                placeholder="Share more details about your experience…"
                maxLength={COMMENT_MAX}
              />

              <div className="text-xs text-slate-500 tabular-nums">
                {form.comment.length}/{COMMENT_MAX}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="submit" variant="primary" disabled={isBusy}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving
                  ? "Saving…"
                  : mode === "edit"
                    ? "Save changes"
                    : "Submit review"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(returnTo)}
                disabled={isBusy}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>

              {mode === "edit" ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={onDelete}
                  disabled={isBusy}
                  className="sm:ml-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting…" : "Delete"}
                </Button>
              ) : null}
            </div>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
