import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

import { Pencil, User as UserIcon, MapPin, Trash2 } from "lucide-react";
import { clampRating10, avgFromCategories } from "@/lib/ratings";

// --------------------------------------------------
// Small helpers
// --------------------------------------------------
function tinyPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return (Math.max(0, Math.min(10, n)) / 10) * 100;
}

// (Exported utility — keep behavior exactly)
export function ratingLine(ratings) {
  if (!ratings || typeof ratings !== "object") return "—";
  const order = ["overall", "safety", "cost", "traffic", "cleanliness"];
  return order
    .map((k) => `${k[0].toUpperCase() + k.slice(1)}: ${ratings?.[k] ?? "—"}/10`)
    .join(" • ");
}

// --------------------------------------------------
// UI blocks
// --------------------------------------------------
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
          onClick={() => setOpen((x) => !x)}
          className="text-xs font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
        >
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

function OverallBlock({ score }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-8 text-right">
        <div className="text-2xl font-semibold text-slate-900 tabular-nums">
          {score == null ? "—" : score}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Overall
        </div>
        <div className="text-xs text-slate-500">Avg of 4 ratings</div>
      </div>
    </div>
  );
}

function MiniBars({ ratings, barClassName = "bg-blue-500/35" }) {
  // Keep order stable + labels consistent everywhere
  const items = [
    ["Safety", clampRating10(ratings?.safety)],
    ["Cost", clampRating10(ratings?.cost)],
    ["Traffic", clampRating10(ratings?.traffic)],
    ["Cleanliness", clampRating10(ratings?.cleanliness)],
  ];

  return (
    <div className="grid gap-2">
      {items.map(([label, val]) => (
        <div
          key={label}
          className="grid grid-cols-[90px_1fr_44px] items-center gap-2"
        >
          <div className="text-xs font-medium text-slate-600">{label}</div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${barClassName}`}
              style={{
                width: `${tinyPct(val)}%`,
                opacity: val == null ? 0.2 : 1,
              }}
            />
          </div>

          <div className="text-right text-xs font-semibold text-slate-900 tabular-nums">
            {val == null ? "—" : `${val}/10`}
          </div>
        </div>
      ))}
    </div>
  );
}

// --------------------------------------------------
// Component
// --------------------------------------------------
export default function ReviewCard({
  review,
  variant = "public", // "public" | "account" | "list"
  title,
  showCity = false,
  cityLabel = null,
  editTo = null,
  editState = undefined,
  showIdentity,
  onDelete = null,
}) {
  const isList = variant === "list";

  // Display rules
  const displayTitle = title || (variant === "account" ? "You" : "Anonymous");
  const shouldShowIdentity = showIdentity ?? variant !== "account";

  const citySlug = review?.cityId || null;
  const cityText = cityLabel || citySlug;

  // Prefer explicit overall, else average the 4 categories.
  const derivedAvg = useMemo(
    () => avgFromCategories(review?.ratings),
    [review?.ratings],
  );

  const explicitOverall = clampRating10(review?.ratings?.overall);
  const headlineScore =
    explicitOverall ??
    (derivedAvg == null ? null : Math.round(derivedAvg * 10) / 10);

  // Public cards are view-only; account/list can show delete if provided
  const canDelete = variant !== "public" && typeof onDelete === "function";

  return (
    <Card className="overflow-hidden border-slate-200/70 bg-white-100/70 shadow-l transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      <CardContent className={isList ? "px-6 py-5" : "px-6 py-4"}>
        <div className="grid gap-4 md:grid-cols-[240px_1fr] md:grid-rows-[auto_1fr] md:items-start md:gap-y-3">
          {/* 1) HEADER (mobile first, desktop right col row 1) */}
          <div className="order-1 flex flex-wrap items-center gap-2 md:order-none md:col-start-2 md:row-start-1 md:border-l md:border-slate-200 md:pl-6">
            {shouldShowIdentity ? (
              <div className="flex min-w-0 items-center gap-2 font-semibold text-slate-900">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </span>
                <span className="truncate">{displayTitle}</span>
              </div>
            ) : null}

            {showCity && cityText && citySlug ? (
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
            ) : null}
          </div>

          {/* 2) LEFT METRICS (mobile second, desktop left col spans both rows) */}
          <div className="order-2 space-y-4 md:order-none md:col-start-1 md:row-start-1 md:row-span-2">
            <OverallBlock
              score={headlineScore == null ? null : Math.round(headlineScore)}
            />
            <MiniBars
              ratings={review?.ratings}
              barClassName="bg-[hsl(var(--primary))]"
            />
          </div>

          {/* 3) COMMENT + ACTIONS (mobile third, desktop right col row 2) */}
          <div className="order-3 min-w-0 md:order-none md:col-start-2 md:row-start-2 md:border-l md:border-slate-200 md:pl-6 md:h-full">
            <div className="min-w-0 flex flex-col gap-3 md:h-full">
              <CommentBlock text={review?.comment} clampChars={160} />

              <div className="mt-2 md:mt-auto grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:justify-end sm:gap-2">
                {editTo ? (
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
                ) : null}

                {canDelete ? (
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
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
