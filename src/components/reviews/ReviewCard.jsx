import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button.jsx";

import { fmtDateTime, fmtDate } from "@/lib/datetime";

import { Pencil, MapPin, Trash2 } from "lucide-react";
import ReactionBar from "@/components/reviews/ReactionBar";
import {
  RATING_KEYS,
  RATING_LABELS,
  clampRating10,
  avgFromCategories,
  scoreColor,
  scoreLabel,
} from "@/lib/ratings";
import { cn } from "@/utils/utils";

function initialsFromName(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function TimestampLine({
  createdAtIso,
  updatedAtIso,
  isEdited = false,
  showTime = false,
}) {
  const createdLabel = createdAtIso
    ? showTime
      ? fmtDateTime(createdAtIso)
      : fmtDate(createdAtIso)
    : null;
  const updatedLabel =
    isEdited && updatedAtIso
      ? showTime
        ? fmtDateTime(updatedAtIso)
        : fmtDate(updatedAtIso)
      : null;

  if (!createdLabel && !updatedLabel) return null;

  return (
    <span className="text-xs text-slate-400">
      {createdLabel ? <span>{createdLabel}</span> : null}
      {updatedLabel ? (
        <span className="ml-1.5">· edited {updatedLabel}</span>
      ) : null}
    </span>
  );
}

function CommentBlock({ text, clampChars = 200 }) {
  const trimmed = (text || "").trim();
  const [open, setOpen] = useState(false);

  if (!trimmed)
    return <p className="text-sm italic text-slate-400">No written comment.</p>;

  const isLong = trimmed.length > clampChars;
  const shown =
    !isLong || open ? trimmed : `${trimmed.slice(0, clampChars).trim()}…`;

  return (
    <div className="space-y-1.5">
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
        {shown}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

function CategoryChips({ ratings }) {
  const items = RATING_KEYS.map((key) => {
    const rating = clampRating10(ratings?.[key]);
    const tone = scoreColor(rating ?? null);
    return { key, label: RATING_LABELS[key] ?? key, rating, halo: tone.halo };
  });

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
      {items.map(({ key, label, rating, halo }) => (
        <div
          key={key}
          className={cn(
            "flex items-center justify-between rounded-lg border bg-white px-2.5 py-1.5",
            halo,
          )}
        >
          <span className="text-xs font-medium text-slate-500">{label}</span>
          <span className="text-sm font-bold tabular-nums text-slate-900">
            {rating ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Full review card — header (avatar + author + score), category chips,
 * comment, and footer (reactions + actions).
 */
export default function ReviewCard({
  review,
  variant = "public",
  title,
  showCity = false,
  cityLabel = null,
  editTo = null,
  editState = undefined,
  onDelete = null,
  reactions = null,
  myReaction = null,
  currentUserId = null,
  isOwnReview = false,
  onReactionChange = null,
  reactionsDisabled = false,
}) {
  const displayTitle = title || (variant === "account" ? "You" : "Anonymous");
  const citySlug = review?.cityId ?? null;
  const cityText = cityLabel || citySlug;
  const createdAtIso = review?.createdAt ?? null;
  const updatedAtIso = review?.updatedAt ?? null;
  const isEdited = review?.isEdited ?? false;

  const derivedAvg = useMemo(
    () => avgFromCategories(review?.ratings),
    [review?.ratings],
  );
  const explicitOverall = clampRating10(review?.ratings?.overall);
  const headlineScore =
    explicitOverall ??
    (derivedAvg == null ? null : Math.round(derivedAvg * 10) / 10);
  const roundedScore = headlineScore == null ? null : Math.round(headlineScore);

  const tone = scoreColor(roundedScore);
  const label = scoreLabel(roundedScore);
  const canDelete = variant !== "public" && typeof onDelete === "function";

  // Avatar: initials for named users, icon for anonymous/account-city variant
  const initials =
    variant === "account" ? null : initialsFromName(displayTitle);
  const isAnon = displayTitle === "Anonymous";

  return (
    <div className="rounded-lg border border-slate-300 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="px-5 py-4 space-y-3">
        {/* ── Header: avatar + author/city + timestamp + overall score ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* Avatar */}
            {variant === "account" && cityText && citySlug ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                <MapPin className="h-4 w-4 text-slate-400" />
              </span>
            ) : isAnon ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-400 select-none">
                ?
              </span>
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-[13px] font-bold text-white select-none shadow-sm">
                {initials}
              </span>
            )}

            {/* Name / city link + timestamp */}
            <div className="min-w-0">
              {variant === "account" && cityText && citySlug ? (
                <Link
                  to={`/cities/${citySlug}`}
                  className="block truncate text-sm font-semibold text-slate-900 hover:underline"
                >
                  {cityText}
                </Link>
              ) : variant !== "account" && showCity && cityText && citySlug ? (
                <>
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {displayTitle}
                  </span>
                  <Link
                    to={`/cities/${citySlug}`}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    {cityText}
                  </Link>
                </>
              ) : (
                <span className="block truncate text-sm font-semibold text-slate-900">
                  {displayTitle}
                </span>
              )}
              <TimestampLine
                createdAtIso={createdAtIso}
                updatedAtIso={updatedAtIso}
                isEdited={isEdited}
              />
            </div>
          </div>

          {/* Overall score badge */}
          <div
            className={cn(
              "shrink-0 inline-flex items-baseline gap-0.5 rounded-lg border bg-white px-2.5 py-1",
              tone.halo,
            )}
          >
            <span className="text-lg font-bold tabular-nums leading-none text-slate-900">
              {roundedScore ?? "—"}
            </span>
            <span className="text-[10px] font-medium text-slate-400">/10</span>
            {label && (
              <span
                className={cn(
                  "ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  tone.pill,
                )}
              >
                {label}
              </span>
            )}
          </div>
        </div>

        {/* ── Category chips ── */}
        <CategoryChips ratings={review?.ratings} />

        {/* ── Comment ── */}
        <CommentBlock text={review?.comment} clampChars={200} />

        {/* ── Footer: reactions + actions ── */}
        {(reactions !== null || editTo || canDelete) && (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="min-w-0">
              {variant !== "account" && reactions !== null && (
                <ReactionBar
                  reviewId={review?.id}
                  citySlug={review?.cityId}
                  reactions={reactions}
                  myReaction={myReaction}
                  currentUserId={currentUserId}
                  isOwnReview={isOwnReview}
                  onReactionChange={onReactionChange}
                  disabled={reactionsDisabled}
                />
              )}
            </div>

            {(editTo || canDelete) && (
              <div className="flex shrink-0 items-center gap-2">
                {editTo && (
                  <Button asChild variant="secondary" size="sm">
                    <Link
                      to={editTo}
                      state={editState}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                )}
                {canDelete && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
