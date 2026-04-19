import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/auth/authContext";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { ConfirmDialog } from "@/components/ui/Dialog";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { RatingSlider } from "@/components/ui/RatingSlider";
import SectionCard from "@/components/layout/SectionCard";
import PageHero from "@/components/layout/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/utils/utils";

import { Save, Star, Trash2, X } from "lucide-react";

import { safeReturnTo } from "@/lib/routing";
import { prettyCityFromSlug } from "@/lib/cities";
import {
  RATING_KEYS,
  RATING_LABELS,
  clampRating10,
  derivedOverall,
  makeEmptyReviewForm,
  normalizeReviewToForm,
  scoreColor,
} from "@/lib/ratings";
import { fetchMyReview, upsertMyReview, deleteMyReview } from "@/lib/reviews";

const RATING_DESCRIPTIONS = {
  safety: "How safe did you feel day-to-day?",
  affordability: "Cost of living, dining & activities",
  walkability: "Transit, bikeability & foot traffic",
  cleanliness: "Maintenance, air quality & upkeep",
};

const COMMENT_MAX = 800;

/** Review create/edit form — loads an existing review if one exists, then saves or deletes via the API. */
export default function ReviewEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const returnTo = useMemo(() => {
    const fromState = safeReturnTo(location.state?.returnTo);
    return fromState || (slug ? `/cities/${slug}` : "/cities");
  }, [location.state, slug]);

  const cityLabel = useMemo(() => prettyCityFromSlug(slug), [slug]);

  const [mode, setMode] = useState("create");

  const [form, setForm] = useState(() => makeEmptyReviewForm());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const pageTitle =
    authLoading || isLoading
      ? "Review"
      : `${mode === "edit" ? "Edit Review" : "Write Review"} — ${cityLabel}`;

  usePageTitle(pageTitle);

  useEffect(() => {
    if (authLoading) return;
    if (!slug) return;

    if (!user) {
      setMode("create");
      setForm(makeEmptyReviewForm());
      setIsLoading(false);
      setError("");
      return;
    }

    let alive = true;
    setIsLoading(true);
    setError("");

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
        console.error(e);
        if (!alive) return;
        setError(
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

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!slug) return;

      setIsSaving(true);
      setError("");

      try {
        const payload = {
          ratings: {
            ...form.ratings,
            overall: derivedOverall(form.ratings),
          },
          comment: form.comment?.trim() ? form.comment.trim() : null,
        };

        const res = await upsertMyReview(slug, payload);
        const created = !!res?.data?.created;

        navigate(returnTo, {
          replace: true,
          state: { reviewSaved: true, created, citySlug: slug },
        });
      } catch (err) {
        setError(
          err?.response?.data?.error?.message || "Failed to save review.",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [slug, form, navigate, returnTo],
  );

  const onDelete = useCallback(() => {
    if (!slug || mode !== "edit") return;
    setConfirmDeleteOpen(true);
  }, [slug, mode]);

  const executeDelete = useCallback(async () => {
    if (!slug) return;
    setIsDeleting(true);
    setError("");
    try {
      await deleteMyReview(slug);
      navigate(returnTo, {
        replace: true,
        state: { reviewDeleted: true, citySlug: slug },
      });
    } catch (err) {
      setError(
        err?.response?.data?.error?.message || "Failed to delete review.",
      );
    } finally {
      setIsDeleting(false);
    }
  }, [slug, navigate, returnTo]);

  if (authLoading || isLoading) {
    return <Loading variant="page" />;
  }

  const overallScore = derivedOverall(form.ratings);
  const overallColors = scoreColor(overallScore);
  const isBusy = isSaving || isDeleting;

  return (
    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete your review?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={executeDelete}
      />

      <PageHero
        className="pt-1 pb-1"
        title={mode === "edit" ? "Edit Review" : "Write a Review"}
        description={
          mode === "edit"
            ? `Update your review of ${cityLabel}.`
            : `Share your honest experience living in or visiting ${cityLabel}.`
        }
      />

      {error ? <ErrorMessage message={error} /> : null}

      <form onSubmit={onSubmit} className="flex flex-col gap-2 mt-0">
        <SectionCard
          icon={Star}
          title="Rate Your Experience"
          subtitle="Rate each category and share your thoughts."
          action={
            <div
              className={cn(
                "inline-flex items-baseline gap-1 rounded-lg border px-3 py-1.5",
                overallColors.badge,
              )}
            >
              <span className="text-2xl font-bold tabular-nums leading-none">
                {overallScore}
              </span>
              <span className="text-xs font-medium opacity-50">/10</span>
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide opacity-60">
                Overall
              </span>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {RATING_KEYS.map((key) => (
                <RatingSlider
                  key={key}
                  label={RATING_LABELS[key] ?? key}
                  description={RATING_DESCRIPTIONS[key]}
                  value={Number(form.ratings[key]) || 6}
                  onChange={(newValue) => setRating(key, newValue)}
                  min={1}
                  max={10}
                  minLabel="Poor"
                  maxLabel="Excellent"
                />
              ))}
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-semibold text-slate-900">
                  Additional Comments{" "}
                  <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <span className="text-xs tabular-nums text-slate-400">
                  {form.comment.length}&thinsp;/&thinsp;{COMMENT_MAX}
                </span>
              </div>
              <textarea
                className="w-full resize-y rounded-lg border border-slate-400 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-[hsl(var(--ring))] focus:bg-white focus:ring-2 focus:ring-[hsl(var(--ring))]/30"
                value={form.comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="What stood out most? Any tips for someone considering a visit or move?"
                maxLength={COMMENT_MAX}
              />
            </div>

            <div className="h-px bg-slate-100" />

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="flex gap-2">
                <Button type="submit" variant="primary" disabled={isBusy}>
                  <Save />
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
                  <X />
                  Cancel
                </Button>
              </div>

              {mode === "edit" ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={onDelete}
                  disabled={isBusy}
                  className="w-full sm:ml-auto sm:w-auto"
                >
                  <Trash2 />
                  {isDeleting ? "Deleting…" : "Delete review"}
                </Button>
              ) : null}
            </div>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
