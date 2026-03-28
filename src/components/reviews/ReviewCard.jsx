import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { fmtDateTime, fmtDate } from "@/lib/datetime";
import { clamp01 } from "@/lib/format";

import { Pencil, User as UserIcon, MapPin, Trash2 } from "lucide-react";
import ReactionBar from "@/components/reviews/ReactionBar";
import { clampRating10, avgFromCategories, scoreColor } from "@/lib/ratings";

/** Converts a 0–10 rating to a 0–100 percentage clamped to [0, 1] for bar widths. */
function tinyPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return clamp01(n / 10) * 100;
}


/** Displays posted and (if edited) last-edited timestamps; returns null if neither date is available. */
function TimestampLine({ createdAtIso, updatedAtIso, isEdited = false, showTime = false }) {
  const createdLabel = createdAtIso
    ? showTime
      ? fmtDateTime(createdAtIso)
      : fmtDate(createdAtIso)
    : null;

  const updatedLabel = isEdited && updatedAtIso
    ? showTime
      ? fmtDateTime(updatedAtIso)
      : fmtDate(updatedAtIso)
    : null;

  if (!createdLabel && !updatedLabel) return null;

  return (
    <div className="text-[11px] text-slate-500">
      {createdLabel ? <span>Posted {createdLabel}</span> : null}
      {updatedLabel ? (
        <span className="ml-2">• Edited {updatedLabel}</span>
      ) : null}
    </div>
  );
}

/** Renders review comment text with expand/collapse for long content (threshold: `clampChars`). */
function CommentBlock({ text, clampChars = 180 }) {
  const trimmed = (text || "").trim();
  const [open, setOpen] = useState(false);

  if (!trimmed) return <span className="text-slate-500">No comment.</span>;

  const isLong = trimmed.length > clampChars;
  const shown =
    !isLong || open ? trimmed : `${trimmed.slice(0, clampChars).trim()}…`;

  return (
    <div className="space-y-2">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
        {shown}
      </p>

      {isLong ? (
        <button
          type="button"
          onClick={() => setOpen((isOpen) => !isOpen)}
          className="text-xs font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
        >
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

/** Displays the overall score as a colour-coded badge (e.g. `7/10 Overall`). */
function OverallBlock({ score }) {
  const { badge: badgeClass } = scoreColor(score);

  return (
    <div className={`inline-flex items-baseline gap-1 rounded-lg border px-3 py-1.5 ${badgeClass}`}>
      <span className="text-2xl font-bold tabular-nums leading-none">
        {score == null ? "—" : score}
      </span>
      <span className="text-xs font-medium opacity-50">/10</span>
      <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide opacity-60">
        Overall
      </span>
    </div>
  );
}

/** Grid of mini progress bars for safety, affordability, walkability, and cleanliness ratings. */
function MiniBars({ ratings, barClassName = "bg-blue-500/35" }) {
  const items = [
    ["Safety", clampRating10(ratings?.safety)],
    ["Affordability", clampRating10(ratings?.affordability)],
    ["Walkability", clampRating10(ratings?.walkability)],
    ["Cleanliness", clampRating10(ratings?.cleanliness)],
  ];

  return (
    <div className="grid gap-2">
      {items.map(([label, rating]) => (
        <div
          key={label}
          className="grid grid-cols-[90px_1fr_44px] items-center gap-2"
        >
          <div className="text-xs font-medium text-slate-600">{label}</div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${barClassName}`}
              style={{
                width: `${tinyPct(rating)}%`,
                opacity: rating == null ? 0.2 : 1,
              }}
            />
          </div>

          <div className="text-right text-xs font-semibold text-slate-900 tabular-nums">
            {rating == null ? "—" : `${rating}/10`}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Full review card showing scores, category bars, comment, author/city info, and optional edit/delete actions.
 * `variant` controls layout and auth-gated actions: `"public"` | `"account"` | `"list"`.
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
  // Reactions
  reactions = null,
  myReaction = null,
  currentUserId = null,
  isOwnReview = false,
  onReactionChange = null,
  reactionsDisabled = false,
}) {
  const isList = variant === "list";

  const displayTitle = title || (variant === "account" ? "You" : "Anonymous");

  const citySlug = review?.cityId || null;
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

  const canDelete = variant !== "public" && typeof onDelete === "function";

  return (
    <Card className="overflow-hidden border-slate-200/70 bg-white-100/70 shadow-l transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      <CardContent className={isList ? "px-6 py-5" : "px-6 py-4"}>
        <div className="grid gap-4 md:grid-cols-[240px_1fr] md:grid-rows-[auto_1fr] md:items-start md:gap-y-3">
          <div className="order-1 flex flex-col gap-2 md:order-none md:col-start-2 md:row-start-1 md:border-l md:border-slate-200 md:pl-6">
            <div className="flex min-w-0 items-center gap-2 font-semibold text-slate-900">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
                {variant === "account"
                  ? <MapPin className="h-4 w-4 text-slate-400" />
                  : <UserIcon className="h-4 w-4 text-slate-400" />}
              </span>

              {variant === "account" && cityText && citySlug ? (
                <Link
                  to={`/cities/${citySlug}`}
                  className="truncate underline"
                >
                  {cityText}
                </Link>
              ) : (
                <span className="truncate">{displayTitle}</span>
              )}

              <span className="hidden lg:inline text-slate-300">|</span>

              <div className="hidden lg:block whitespace-nowrap">
                <TimestampLine
                  createdAtIso={createdAtIso}
                  updatedAtIso={updatedAtIso}
                  isEdited={isEdited}
                />
              </div>
            </div>

            <div className="whitespace-nowrap lg:hidden">
              <TimestampLine
                createdAtIso={createdAtIso}
                updatedAtIso={updatedAtIso}
                isEdited={isEdited}
              />
            </div>

            {variant !== "account" && showCity && cityText && citySlug && (
              <Link
                to={`/cities/${citySlug}`}
                className="inline-flex min-w-0 items-center gap-2 font-semibold text-slate-900"
                title="View city"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <MapPin className="h-4 w-4 text-slate-400" />
                </span>

                <span className="truncate underline">{cityText}</span>
              </Link>
            )}
          </div>

          <div className="order-2 space-y-4 md:order-none md:col-start-1 md:row-start-1 md:row-span-2">
            <OverallBlock
              score={headlineScore == null ? null : Math.round(headlineScore)}
            />

            <MiniBars
              ratings={review?.ratings}
              barClassName="bg-[hsl(var(--primary))]"
            />
          </div>

          <div className="order-3 min-w-0 md:order-none md:col-start-2 md:row-start-2 md:border-l md:border-slate-200 md:pl-6 md:h-full">
            <div className="min-w-0 flex flex-col gap-3 md:h-full">
              <CommentBlock text={review?.comment} clampChars={160} />

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

              <div className="mt-2 md:mt-auto grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:justify-end sm:gap-2">
                {editTo && (
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Link
                      to={editTo}
                      state={editState}
                      className="inline-flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>Edit</span>
                    </Link>
                  </Button>
                )}

                {canDelete && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={onDelete}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
