import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "@/services/api";
import { useAuth } from "@/auth/authContext";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Dialog";
import ReviewCard from "@/components/reviews/ReviewCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import PageNav from "@/components/layout/PageNav";
import { Loading } from "@/components/ui/loading";
import ErrorMessage from "@/components/ui/ErrorMessage";

import CityMap from "@/components/city/CityMap";
import CityPhotoGallery from "@/components/city/CityPhotoGallery";
import {
  MapPin,
  Compass,
  ExternalLink,
  Sparkles,
  Wind,
  BarChart3,
  DollarSign,
  Info,
  MessageCircle,
  Shield,
  Star,
  User as UserIcon,
  Users,
  ChevronLeft,
} from "lucide-react";

import {
  fmtMoney,
  fmtOutOf10,
  toOutOf10,
  clamp01,
  safeNumOrNull,
} from "@/lib/format";
import { scoreColor, scoreLabel } from "@/lib/ratings";
import { fmtDateTime } from "@/lib/datetime";
import {
  buildReviewsQuery,
  fetchMyReview,
  deleteMyReview as deleteMyReviewApi,
} from "@/lib/reviews";
import { upsertReaction, deleteReaction } from "@/lib/reactions";
import { fetchMyFavorites, addFavorite, removeFavorite } from "@/lib/favorites";
import FavoriteButton from "@/components/city/FavoriteButton";
import { GitCompareArrows } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REVIEW_PAGE_SIZE = 10;

/** Zero-value reaction entry used as a fallback when a review has no server reaction data. */
const DEFAULT_REVIEW_REACTION = {
  reactions: { helpful: 0, agree: 0, disagree: 0 },
  myReaction: null,
};

const ATTRACTION_CATEGORIES = [
  { key: "attractions", label: "Attractions" },
  { key: "restaurants", label: "Restaurants" },
  { key: "outdoors", label: "Outdoors" },
  { key: "nightlife", label: "Nightlife" },
];

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Returns an EPA category label and Tailwind color class for an AQI value. */
function aqiCategory(aqi) {
  if (aqi == null) {
    return { label: "N/A", color: "text-[hsl(var(--score-neutral))]" };
  }
  if (aqi <= 50) {
    return { label: "Good", color: "text-[hsl(var(--score-good))]" };
  }
  if (aqi <= 100) {
    return { label: "Moderate", color: "text-[hsl(var(--score-ok))]" };
  }
  if (aqi <= 150) {
    return { label: "Unhealthy for Sensitive", color: "text-orange-500" };
  }
  if (aqi <= 200) {
    return { label: "Unhealthy", color: "text-[hsl(var(--score-bad))]" };
  }
  if (aqi <= 300) {
    return { label: "Very Unhealthy", color: "text-purple-600" };
  }
  return { label: "Hazardous", color: "text-[hsl(var(--destructive))]" };
}

/**
 * Returns a new reactionState map with entries from `reviews` merged in,
 * using server-provided reaction counts and the current user's reaction.
 * Does not mutate `prevState`.
 * @param {Record<string, { reactions: object, myReaction: string|null }>} prevState
 * @param {Array} reviews
 */
function mergeReactionsIntoState(prevState, reviews) {
  const updatedState = { ...prevState };
  reviews.forEach((review) => {
    if (review?.id) {
      updatedState[review.id] = {
        reactions: review.reactions ?? DEFAULT_REVIEW_REACTION.reactions,
        myReaction: review.myReaction ?? null,
      };
    }
  });
  return updatedState;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Summary metric tile showing an icon, title, large value, and a subtitle note. */
function MetricCard({ title, icon: Icon, value, subtitle }) {
  return (
    <div className="rounded-lg border border-slate-400 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div className="text-sm font-medium text-slate-600">{title}</div>
      </div>

      <div className="mt-3 text-3xl font-semibold text-slate-900 tabular-nums">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

/** Horizontal rating bar row with label, progress bar, and numeric score. */
function RatingRow({ label, value, objective, polarity = "higher_is_better" }) {
  const safeValue = safeNumOrNull(value);
  const safeObjective = safeNumOrNull(objective);
  const fillPercent = safeValue == null ? 0 : clamp01(safeValue / 10) * 100;
  const objectiveFillPercent =
    safeObjective == null ? 0 : clamp01(safeObjective / 10) * 100;

  const canCompare = safeValue != null && safeObjective != null;
  const gap = canCompare ? safeValue - safeObjective : null;
  const absGap = gap == null ? null : Math.abs(gap);
  const isClose = absGap != null && absGap < 0.4;

  function getGapMessage() {
    if (!canCompare || isClose) return null;
    const peopleRateHigher = gap > 0;
    if (polarity === "higher_is_better") {
      return peopleRateHigher
        ? "Locals rate this higher than the data."
        : "Locals rate this lower than the data.";
    }
    return peopleRateHigher
      ? "Locals rate this lower than the data."
      : "Locals rate this higher than the data.";
  }

  const gapMsg = getGapMessage();
  const gapPositive =
    canCompare &&
    !isClose &&
    ((polarity === "higher_is_better" && gap > 0) ||
      (polarity === "higher_is_worse" && gap < 0));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        {gapMsg && (
          <span
            className={`text-xs font-medium ${gapPositive ? "text-emerald-600" : "text-rose-500"}`}
          >
            {gapMsg}
          </span>
        )}
      </div>
      {/* People say bar */}
      <div className="flex items-center gap-3">
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-[hsl(var(--primary))] transition-[width] duration-300"
            style={{
              width: `${fillPercent}%`,
              opacity: safeValue == null ? 0.25 : 1,
            }}
          />
        </div>
        <span className="w-10 text-right text-sm font-semibold tabular-nums text-slate-900">
          {safeValue == null ? "N/A" : safeValue.toFixed(1)}
        </span>
      </div>
      {/* Objective data bar (gray) */}
      {safeObjective != null && (
        <div className="flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-slate-400 transition-[width] duration-300"
              style={{ width: `${objectiveFillPercent}%` }}
            />
          </div>
          <span className="w-10 text-right text-sm tabular-nums text-slate-400">
            {safeObjective.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}

/** Single attraction card showing name, category badge, rating, and address. */
function AttractionCard({ place }) {
  const primaryCategory = place.categories?.[0] ?? null;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.name,
  )}`;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-400 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="leading-snug text-sm font-semibold text-slate-900">
          {place.name}
        </span>
        <a
          href={googleMapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-slate-400 hover:text-slate-600"
          aria-label={`Search ${place.name} on Google Maps`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {primaryCategory ? (
          <Badge variant="secondary" className="text-xs">
            {primaryCategory}
          </Badge>
        ) : null}
        {place.rating != null ? (
          <span className="text-xs tabular-nums text-slate-500">
            {place.rating.toFixed(1)}/10
          </span>
        ) : null}
      </div>

      {place.address ? (
        <p className="line-clamp-1 text-xs text-slate-500">{place.address}</p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

/** City detail page — loads city data, the current user's review, and public reviews; supports pagination and inline delete. */
export default function CityDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  const [cityData, setCityData] = useState(null);
  const [cityLoadError, setCityLoadError] = useState("");
  const [isCityLoading, setIsCityLoading] = useState(true);

  const [myReview, setMyReview] = useState(null);
  const [isMyReviewLoading, setIsMyReviewLoading] = useState(false);

  const [publicReviews, setPublicReviews] = useState([]);
  const [isPublicLoading, setIsPublicLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [nextPageCursor, setNextPageCursor] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const [attractions, setAttractions] = useState(null);
  const [isAttractionsLoading, setIsAttractionsLoading] = useState(true);
  const [activeAttractionCategory, setActiveAttractionCategory] =
    useState("attractions");

  const [summary, setSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);

  // Map of reviewId -> { reactions: {helpful,agree,disagree}, myReaction: type|null }
  const [reactionState, setReactionState] = useState({});
  // Set of reviewIds with in-flight reaction API calls
  const [reactingReviewIds, setReactingReviewIds] = useState(new Set());

  const city = cityData?.city ?? null;
  const stats = cityData?.stats ?? null;
  const metrics = cityData?.metrics ?? null;

  // averages can be nested under stats.averages or flat on stats
  const avgRatings = stats?.averages ?? stats ?? {};

  usePageTitle(
    city?.name && city?.state ? `${city.name}, ${city.state}` : null,
  );

  /** Redirects to /login with a `returnTo` state so the user lands back here after signing in. */
  const goLoginAndReturn = useCallback(() => {
    navigate("/login", { state: { returnTo } });
  }, [navigate, returnTo]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]); // scroll to top of page when a new page is loaded

  // Fetch core city data (name, state, metrics, stats)
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setCityLoadError("");
    setIsCityLoading(true);
    setCityData(null);

    api
      .get(`/cities/${slug}/details`)
      .then((res) => {
        if (!isMounted) return;
        setCityData(res.data);
      })
      .catch((err) => {
        console.error(err);
        if (!isMounted) return;
        setCityLoadError("Failed to load city details.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsCityLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Fetch first page of public reviews and seed reactionState
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setIsPublicLoading(true);
    setPublicReviews([]);
    setNextPageCursor(null);
    setReviewsError("");

    api
      .get(
        `/cities/${slug}/reviews?${buildReviewsQuery({ pageSize: REVIEW_PAGE_SIZE })}`,
      )
      .then((res) => {
        if (!isMounted) return;
        const fetchedReviews = res.data?.reviews ?? [];
        setPublicReviews(fetchedReviews);
        setNextPageCursor(res.data?.nextCursor ?? null);
        setReactionState((prevState) =>
          mergeReactionsIntoState(prevState, fetchedReviews),
        );
      })
      .catch((err) => {
        console.error(err);
        if (!isMounted) return;
        setReviewsError("Failed to load reviews.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsPublicLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Fetch the current user's own review for this city (skipped when signed out)
  useEffect(() => {
    if (!slug) return;

    if (!user) {
      setMyReview(null);
      setIsMyReviewLoading(false);
      return;
    }

    let isMounted = true;
    setIsMyReviewLoading(true);

    fetchMyReview(slug)
      .then((review) => {
        if (!isMounted) return;
        setMyReview(review);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err?.response?.status !== 404) console.error(err);
        setMyReview(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsMyReviewLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, slug]);

  /**
   * Appends the next page of public reviews, deduplicating against already-loaded reviews
   * and merging their reaction data into reactionState.
   */
  const loadMore = useCallback(async () => {
    if (!slug || !nextPageCursor || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const queryString = buildReviewsQuery({
        pageSize: REVIEW_PAGE_SIZE,
        cursor: nextPageCursor,
      });
      const res = await api.get(`/cities/${slug}/reviews?${queryString}`);

      const newReviews = res.data?.reviews ?? [];
      const newCursor = res.data?.nextCursor ?? null;

      const loadedReviewIds = new Set(
        publicReviews.map((review) => review?.id).filter(Boolean),
      );
      const dedupedReviews = newReviews.filter(
        (review) => !review?.id || !loadedReviewIds.has(review.id),
      );

      setPublicReviews((prev) => [...prev, ...dedupedReviews]);
      setNextPageCursor(dedupedReviews.length > 0 ? newCursor : null);
      setReactionState((prevState) =>
        mergeReactionsIntoState(prevState, dedupedReviews),
      );
    } catch (err) {
      console.error(err);
      setReviewsError("Couldn't load more reviews.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [slug, nextPageCursor, isLoadingMore, publicReviews]);

  // Fetch AI-generated city summary
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setIsSummaryLoading(true);
    setSummaryError(false);

    api
      .get(`/cities/${slug}/summary`)
      .then((res) => {
        if (isMounted) setSummary(res.data);
      })
      .catch(() => {
        if (isMounted) {
          setSummary(null);
          setSummaryError(true);
        }
      })
      .finally(() => {
        if (isMounted) setIsSummaryLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Fetch nearby attractions grouped by category
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setIsAttractionsLoading(true);

    api
      .get(`/cities/${slug}/attractions`)
      .then((res) => {
        if (!isMounted) return;
        setAttractions(res.data);
      })
      .catch(() => {
        if (!isMounted) return;
        setAttractions(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsAttractionsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Check whether this city is in the current user's favorites list
  useEffect(() => {
    if (!user || !slug) {
      setIsFavorited(false);
      return;
    }

    let isMounted = true;

    fetchMyFavorites()
      .then((favorites) => {
        if (!isMounted) return;
        setIsFavorited(favorites.some((fav) => fav.cityId === slug));
      })
      .catch(() => {
        // non-critical — silently ignore, default stays false
      });

    return () => {
      isMounted = false;
    };
  }, [user, slug]);

  /** Toggles this city's favorite status. Redirects to login if the user is signed out. */
  const toggleFavorite = useCallback(async () => {
    if (!user) {
      goLoginAndReturn();
      return;
    }

    setIsFavoriteLoading(true);

    try {
      if (isFavorited) {
        await removeFavorite(slug);
        setIsFavorited(false);
      } else {
        await addFavorite(slug);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFavoriteLoading(false);
    }
  }, [user, slug, isFavorited, goLoginAndReturn]);

  const hasMyReview = !!myReview?.id;

  /**
   * Derived state enum for the "Your Review" section.
   * Drives which UI is shown and whether the write-review action is visible.
   * Values: "auth_loading" | "signed_out" | "review_loading" | "has_review" | "no_review"
   */
  const myReviewState = useMemo(() => {
    if (authLoading) return "auth_loading";
    if (!user) return "signed_out";
    if (isMyReviewLoading) return "review_loading";
    if (hasMyReview) return "has_review";
    return "no_review";
  }, [authLoading, user, isMyReviewLoading, hasMyReview]);

  const publicReviewsExcludingMine = useMemo(() => {
    if (!myReview?.id) return publicReviews;
    return publicReviews.filter((review) => review?.id !== myReview.id);
  }, [publicReviews, myReview]);

  /** Opens the delete confirmation dialog. */
  const openDeleteConfirm = useCallback(() => {
    setIsConfirmDeleteOpen(true);
  }, []);

  /** Calls the API to permanently delete the current user's review, then removes it from local state. */
  const executeDelete = useCallback(async () => {
    if (!slug) return;

    try {
      await deleteMyReviewApi(slug);
      const deletedReviewId = myReview?.id;
      setMyReview(null);

      if (deletedReviewId) {
        setPublicReviews((prev) =>
          prev.filter((review) => review?.id !== deletedReviewId),
        );
      }
    } catch (err) {
      console.error(err);
      setReviewsError("Failed to delete review.");
    }
  }, [slug, myReview?.id]);

  /**
   * Handles a reaction toggle on a public review. Applies an optimistic update immediately
   * and rolls back to the previous entry if the API call fails.
   * @param {string} reviewId
   * @param {string|null} reactionType - Reaction to set ("helpful", "agree", "disagree"), or null to clear.
   */
  const handleReactionChange = useCallback(
    (reviewId, reactionType) => {
      if (!reviewId) return;

      // Snapshot before optimistic update, used for rollback on API failure
      const prevEntry = reactionState[reviewId] ?? DEFAULT_REVIEW_REACTION;

      setReactionState((prevState) => {
        const currentEntry = prevState[reviewId] ?? DEFAULT_REVIEW_REACTION;
        const updatedCounts = { ...currentEntry.reactions };

        // Decrement the previously selected reaction (if any)
        if (currentEntry.myReaction) {
          updatedCounts[currentEntry.myReaction] = Math.max(
            0,
            updatedCounts[currentEntry.myReaction] - 1,
          );
        }

        // Increment the newly selected reaction (if not clearing)
        if (reactionType) {
          updatedCounts[reactionType] = (updatedCounts[reactionType] ?? 0) + 1;
        }

        return {
          ...prevState,
          [reviewId]: { reactions: updatedCounts, myReaction: reactionType },
        };
      });

      setReactingReviewIds((prevSet) => new Set([...prevSet, reviewId]));

      const apiCall = reactionType
        ? upsertReaction(slug, reviewId, reactionType)
        : deleteReaction(slug, reviewId);

      apiCall
        .catch(() => {
          // Roll back optimistic update on failure
          setReactionState((prevState) => ({
            ...prevState,
            [reviewId]: prevEntry,
          }));
        })
        .finally(() => {
          setReactingReviewIds((prevSet) => {
            const updatedSet = new Set(prevSet);
            updatedSet.delete(reviewId);
            return updatedSet;
          });
        });
    },
    [slug, reactionState],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isCityLoading) return <Loading />;

  if (cityLoadError) {
    return <ErrorMessage message={cityLoadError} />;
  }

  if (!city) {
    return <div className="text-sm text-slate-600">City not found.</div>;
  }

  const cityLat = safeNumOrNull(city.lat);
  const cityLng = safeNumOrNull(city.lng);
  const { label: aqiLabel, color: aqiColor } = aqiCategory(metrics?.aqiValue);

  // Action button shown in the "Your Review" section header
  let myReviewAction = null;
  if (myReviewState === "signed_out") {
    myReviewAction = <Button onClick={goLoginAndReturn}>Sign in</Button>;
  } else if (myReviewState === "no_review") {
    myReviewAction = (
      <Button onClick={() => navigate(`/cities/${slug}/review`)}>
        Write review
      </Button>
    );
  } else if (myReviewState === "has_review") {
    // Empty div preserves header layout while edit/delete controls live inside the card
    myReviewAction = <div />;
  }

  return (
    <div className="animate-in space-y-4 fade-in slide-in-from-bottom-2 duration-300">
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Delete your review?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={executeDelete}
      />

      {/* Hero */}
      <div>
        {/* Back link / breadcrumb */}
        <div className="mb-2">
          <Link
            to={location.state?.from === "compare" ? "/compare" : "/cities"}
            className="group inline-flex items-center gap-1 text-s font-medium text-slate-400 no-underline transition-colors hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            {location.state?.from === "compare" ? "Compare" : "All Cities"}
          </Link>
        </div>

        {/* Hero identity row */}
        {(() => {
          const rawLivScore =
            cityData?.livability?.score ?? stats?.livabilityScore;
          const livScore = toOutOf10(rawLivScore);
          const displayLivScore =
            rawLivScore != null ? Math.round(Number(rawLivScore)) : null;
          const tone = scoreColor(livScore);
          const label = scoreLabel(livScore);
          return (
            <div>
              {/* Name + state */}
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                  {city.name}
                </h1>
                {city.state && (
                  <span className="text-xl font-medium text-slate-400 sm:text-2xl">
                    {city.state}
                  </span>
                )}
              </div>

              {/* Actions: livability card + buttons */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div
                  className="inline-flex w-fit items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow"
                  style={{
                    borderColor: `hsl(var(${livScore == null ? "--score-neutral" : livScore >= 7 ? "--score-good" : livScore >= 4 ? "--score-ok" : "--score-bad"}))`,
                  }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Livability
                  </span>
                  {displayLivScore != null ? (
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-bold tabular-nums text-slate-900">
                        {displayLivScore}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        /100
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">
                      N/A
                    </span>
                  )}
                  {label && (
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${tone.pill}`}
                    >
                      {label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FavoriteButton
                    isFavorited={isFavorited}
                    loading={isFavoriteLoading}
                    onToggle={toggleFavorite}
                    variant="secondary"
                    size="sm"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="group"
                    asChild
                  >
                    <Link to={`/compare?a=${slug}`}>
                      <GitCompareArrows className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      Compare
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <PageNav
        items={[
          { href: "#snapshot", label: "City Snapshot" },
          { href: "#metrics", label: "At a Glance" },
          { href: "#radar", label: "Ratings & Insights" },
          { href: "#photos", label: "Photos" },
          { href: "#location", label: "Location" },
          { href: "#things-to-do", label: "Things To Do" },
          { href: "#your-review", label: "Your Review" },
          { href: "#reviews", label: "Reviews" },
        ]}
        label="Jump to:"
      />

      <div
        id="snapshot"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            City Snapshot
          </h2>
        </div>
        <div className="mt-3">
          {isSummaryLoading ? (
            <div className="space-y-2.5">
              <div className="h-3.5 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="h-3.5 w-5/6 animate-pulse rounded-full bg-slate-100" />
              <div className="h-3.5 w-4/6 animate-pulse rounded-full bg-slate-100" />
            </div>
          ) : summaryError ? (
            <p className="text-sm italic text-slate-400">
              Snapshot failed to load.
            </p>
          ) : summary?.summary ? (
            <div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 text-sm italic leading-relaxed text-slate-600 last:mb-0">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="not-italic font-semibold text-slate-900">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-2 ml-4 list-disc space-y-0.5 text-sm italic text-slate-600">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                }}
              >
                {summary.summary}
              </ReactMarkdown>

              {summary.generatedAt ? (
                <p className="mt-2 text-xs text-slate-400">
                  Generated by AI ·{" "}
                  {new Date(summary.generatedAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">
              AI snapshot not yet available for this city.
            </p>
          )}
        </div>
      </div>

      <div
        id="metrics"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-500" />
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                At a Glance
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Key facts and figures about this city.
            </p>
          </div>
          <div className="group relative sm:shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/methodology")}
            >
              <Info className="h-4 w-4 shrink-0 text-slate-400" />
              <span>How we calculate this</span>
            </Button>
            <div className="pointer-events-none absolute right-0 top-11 z-20 w-64 rounded-md border border-slate-400 bg-white px-3 py-2 text-xs text-slate-600 shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Learn where this data comes from and how it's calculated.
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Safety Score"
              icon={Shield}
              value={fmtOutOf10(metrics?.safetyScore)}
              subtitle="based on crime data"
            />
            <MetricCard
              title="Typical Rent"
              icon={DollarSign}
              value={
                metrics?.medianRent != null
                  ? fmtMoney(metrics.medianRent)
                  : "N/A"
              }
              subtitle="median monthly rent"
            />
            <MetricCard
              title="Population"
              icon={Users}
              value={
                metrics?.population != null
                  ? Number(metrics.population).toLocaleString()
                  : "N/A"
              }
              subtitle="latest estimate"
            />
            <MetricCard
              title="Air Quality"
              icon={Wind}
              value={
                metrics?.aqiValue != null ? `${metrics.aqiValue} AQI` : "N/A"
              }
              subtitle={
                metrics?.aqiValue != null ? (
                  <span className={aqiColor}>{aqiLabel}</span>
                ) : (
                  "no data yet"
                )
              }
            />
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Data last updated{" "}
            {fmtDateTime(metrics?.meta?.metricsSync?.syncedAtIso)}
          </div>
        </div>
      </div>

      <div
        id="radar"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Ratings & Insights
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Resident scores compared to objective city data.
          </p>
        </div>
        <div className="mt-3">
          <div className="space-y-4">
            <RatingRow
              label="Safety"
              value={avgRatings?.safety}
              objective={metrics?.safetyScore}
            />
            <RatingRow
              label="Affordability"
              value={avgRatings?.affordability}
              objective={metrics?.costScore}
              polarity="higher_is_better"
            />
            <RatingRow label="Walkability" value={avgRatings?.walkability} />
            <RatingRow label="Cleanliness" value={avgRatings?.cleanliness} />
            <RatingRow label="Overall" value={avgRatings?.overall} />
            {(metrics?.safetyScore != null || metrics?.costScore != null) && (
              <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-4 rounded-full bg-[hsl(var(--primary))]" />
                  People say
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-4 rounded-full bg-slate-400" />
                  Data
                </span>
              </div>
            )}
            {stats?.count != null && stats.count > 0 ? (
              <p className="text-xs text-slate-400">
                Based on {stats.count}{" "}
                {stats.count === 1 ? "review" : "reviews"}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div
        id="photos"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <CityPhotoGallery slug={slug} />
      </div>

      <div
        id="location"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Location
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Where this city is on the map.
          </p>
        </div>
        <div className="mt-3">
          {Number.isFinite(cityLat) && Number.isFinite(cityLng) ? (
            <CityMap
              cityName={city.name}
              state={city.state}
              lat={cityLat}
              lng={cityLng}
            />
          ) : (
            <div className="text-sm text-slate-600">
              Map coming soon (missing latitude/longitude for this city).
            </div>
          )}
        </div>
      </div>

      <div
        id="things-to-do"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Things To Do
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Popular spots nearby sourced from Foursquare.
        </p>
        <div className="mt-3">
          <div className="mb-4 flex flex-wrap gap-2">
            {ATTRACTION_CATEGORIES.map((category) => (
              <Button
                key={category.key}
                variant={
                  activeAttractionCategory === category.key
                    ? "secondary"
                    : "ghost"
                }
                size="sm"
                onClick={() => setActiveAttractionCategory(category.key)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {isAttractionsLoading ? (
            <Loading label="Loading attractions…" />
          ) : (
            (() => {
              const activePlaces =
                attractions?.categories?.[activeAttractionCategory] ?? [];

              return activePlaces.length === 0 ? (
                <div className="text-sm text-slate-600">
                  No attractions data available yet.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {activePlaces.map((place) => (
                    <AttractionCard
                      key={place.fsqId ?? place.name}
                      place={place}
                    />
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </div>

      <div
        id="your-review"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-slate-500" />
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Your Review
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Your ratings and comment for this city.
            </p>
          </div>
          {myReviewAction}
        </div>
        <div className="mt-3">
          {myReviewState === "auth_loading" ? (
            <Loading label="Checking sign-in…" />
          ) : myReviewState === "signed_out" ? (
            <div className="text-sm text-slate-600">
              Sign in to leave a review for this city.
            </div>
          ) : myReviewState === "review_loading" ? (
            <Loading label="Loading your review…" />
          ) : myReviewState === "no_review" ? (
            <div className="text-sm text-slate-600">
              You haven't reviewed this city yet.
            </div>
          ) : (
            <ReviewCard
              review={myReview}
              variant="list"
              title="You"
              editTo={`/cities/${slug}/review`}
              onDelete={openDeleteConfirm}
            />
          )}
        </div>
      </div>

      <div
        id="reviews"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Reviews
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Public reviews for this city.
        </p>
        <div className="mt-3">
          {isPublicLoading ? <Loading label="Loading reviews…" /> : null}

          {reviewsError ? <ErrorMessage message={reviewsError} /> : null}

          {!isPublicLoading &&
          !reviewsError &&
          publicReviewsExcludingMine.length === 0 ? (
            <div className="text-sm text-slate-600">No reviews yet.</div>
          ) : !reviewsError ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {publicReviewsExcludingMine.map((review, idx) => {
                const reviewReactions = reactionState[review?.id] ?? {
                  reactions:
                    review?.reactions ?? DEFAULT_REVIEW_REACTION.reactions,
                  myReaction: review?.myReaction ?? null,
                };

                return (
                  <ReviewCard
                    key={
                      review?.id ||
                      `${review?.cityId || slug}__${review?.createdAtIso || idx}`
                    }
                    review={review}
                    variant="list"
                    title="Anonymous"
                    reactions={reviewReactions.reactions}
                    myReaction={reviewReactions.myReaction}
                    currentUserId={user?.sub ?? null}
                    isOwnReview={false}
                    onReactionChange={handleReactionChange}
                    reactionsDisabled={reactingReviewIds.has(review?.id)}
                  />
                );
              })}
            </div>
          ) : null}

          <div className="pt-4">
            {nextPageCursor ? (
              <Button onClick={loadMore} variant="secondary" size="default">
                {isLoadingMore ? <Loading /> : "Load more"}
              </Button>
            ) : publicReviewsExcludingMine.length > 0 ? (
              <div className="text-xs text-slate-500">No more reviews.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
