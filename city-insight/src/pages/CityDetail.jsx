import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import api from "@/services/api";
import { useAuth } from "@/auth/authContext";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import ReviewCard from "@/components/reviews/ReviewCard";
import { BackLink } from "@/components/ui/back-link";
import { usePageTitle } from "@/hooks/usePageTitle";
import SectionCard from "@/components/layout/SectionCard";
import PageHero from "@/components/layout/PageHero";
import PerceptionVsRealityChart from "@/components/city/PerceptionVsRealityChart";
import { Loading } from "@/components/ui/loading";

import CityMap from "@/components/city/CityMap";
import { MapPin } from "lucide-react";

import {
  Car,
  BarChart3,
  Trash2,
  DollarSign,
  Info,
  MessageCircle,
  Shield,
  Star,
  User as UserIcon,
  Users,
} from "lucide-react";

import { fmtMoney, clamp01, safeNumOrNull, toOutOf10 } from "@/lib/format";
import { fmtDateTime } from "@/lib/datetime";
import {
  buildReviewsQuery,
  deleteMyReview as deleteMyReviewApi,
} from "@/lib/reviews";

function fmtOutOf10(x) {
  const n = safeNumOrNull(x);
  return n == null ? "—" : `${n.toFixed(1)}/10`;
}

function MetricCard({ title, icon: Icon, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-5 shadow-xl">
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

function RatingRow({ label, value, icon: Icon }) {
  const safeValue = safeNumOrNull(value); // 0–10
  const pct = safeValue == null ? 0 : clamp01(safeValue / 10) * 100;

  return (
    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[200px_1fr_72px] sm:gap-4">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
        <span>{label}</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
        <div
          className="h-full bg-[hsl(var(--primary))] transition-[width] duration-300"
          style={{ width: `${pct}%`, opacity: safeValue == null ? 0.25 : 1 }}
        />
      </div>

      <div className="text-right text-sm font-semibold text-slate-900 tabular-nums">
        {safeValue == null ? "—" : `${safeValue.toFixed(1)}/10`}
      </div>
    </div>
  );
}

export default function CityDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  const [cityData, setCityData] = useState(null);
  const [cityError, setCityError] = useState("");
  const [isCityLoading, setIsCityLoading] = useState(true);

  const [myReview, setMyReview] = useState(null);
  const [isMyReviewLoading, setIsMyReviewLoading] = useState(false);

  const [publicReviews, setPublicReviews] = useState([]);
  const [isPublicLoading, setIsPublicLoading] = useState(false);

  const [nextCursor, setNextCursor] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const city = cityData?.city ?? null;
  const stats = cityData?.stats ?? null;
  const metrics = cityData?.metrics ?? null;
  const livability = cityData?.livability ?? null;

  // averages can be nested under stats.averages or flat on stats
  const avgRatings = stats?.averages ?? stats ?? {};

  usePageTitle(
    city?.name && city?.state ? `${city.name}, ${city.state}` : null,
  );

  // livability.score is 0–100; toOutOf10 divides by 10 to get 0.0–10.0
  const heroScore = useMemo(() => {
    const raw =
      (livability && typeof livability === "object"
        ? livability.score
        : null) ??
      stats?.livabilityScore ??
      null;
    return toOutOf10(raw);
  }, [livability, stats]);

  const goLoginAndReturn = useCallback(() => {
    navigate("/login", { state: { returnTo } });
  }, [navigate, returnTo]);

  useEffect(() => {
    if (!slug) return;

    let alive = true;
    setCityError("");
    setIsCityLoading(true);
    setCityData(null);

    api
      .get(`/cities/${slug}/details`)
      .then((res) => {
        if (!alive) return;
        setCityData(res.data);
      })
      .catch((err) => {
        console.error(err);
        if (!alive) return;
        setCityError("Failed to load city details.");
      })
      .finally(() => {
        if (!alive) return;
        setIsCityLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    let alive = true;
    setIsPublicLoading(true);
    setPublicReviews([]);
    setNextCursor(null);

    api
      .get(`/cities/${slug}/reviews?pageSize=10`)
      .then((res) => {
        if (!alive) return;
        setPublicReviews(res.data?.reviews || []);
        setNextCursor(res.data?.nextCursor || null);
      })
      .catch((err) => {
        console.error(err);
        if (!alive) return;
        setPublicReviews([]);
        setNextCursor(null);
      })
      .finally(() => {
        if (!alive) return;
        setIsPublicLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    if (!user) {
      setMyReview(null);
      setIsMyReviewLoading(false);
      return;
    }

    let alive = true;
    setIsMyReviewLoading(true);

    api
      .get(`/cities/${slug}/reviews/me`)
      .then((res) => {
        if (!alive) return;
        setMyReview(res.data?.review ?? null);
      })
      .catch(() => {
        if (!alive) return;
        setMyReview(null);
      })
      .finally(() => {
        if (!alive) return;
        setIsMyReviewLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user, slug]);

  const loadMore = useCallback(async () => {
    if (!slug || !nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const qs = buildReviewsQuery({ pageSize: 10, cursor: nextCursor });
      const res = await api.get(`/cities/${slug}/reviews?${qs}`);

      const newReviews = res.data?.reviews || [];
      const newCursor = res.data?.nextCursor || null;

      const existingIds = new Set(
        publicReviews.map((r) => r?.id).filter(Boolean),
      );
      const unique = newReviews.filter((r) => !r?.id || !existingIds.has(r.id));

      setPublicReviews((prev) => [...prev, ...unique]);
      setNextCursor(unique.length > 0 ? newCursor : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [slug, nextCursor, isLoadingMore, publicReviews]);

  const hasMyReview = !!myReview?.id;

  const myReviewState = useMemo(() => {
    if (authLoading) return "auth_loading";
    if (!user) return "signed_out";
    if (isMyReviewLoading) return "review_loading";
    if (hasMyReview) return "has_review";
    return "no_review";
  }, [authLoading, user, isMyReviewLoading, hasMyReview]);

  const publicReviewsExcludingMine = useMemo(() => {
    if (!myReview?.id) return publicReviews;
    return publicReviews.filter((r) => r?.id !== myReview.id);
  }, [publicReviews, myReview]);

  const insights = useMemo(() => {
    const userSafety = safeNumOrNull(avgRatings?.safety);
    const userAffordability = safeNumOrNull(avgRatings?.affordability);

    const objSafety =
      metrics?.safetyScore != null ? safeNumOrNull(metrics.safetyScore) : null;

    const objCost =
      metrics?.costScore != null ? safeNumOrNull(metrics.costScore) : null;

    return {
      safetyRows: [
        {
          key: "safety",
          label: "Safety",
          user: userSafety,
          objective: Number.isFinite(objSafety) ? objSafety : null,
          polarity: "higher_is_better",
        },
      ],
      costRows: [
        {
          key: "affordability",
          label: "Affordability",
          user: userAffordability,
          objective: objCost,
          polarity: "higher_is_better",
        },
      ],
    };
  }, [avgRatings, metrics]);

  const deleteMyReview = useCallback(() => {
    setConfirmDeleteOpen(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (!slug) return;
    try {
      await deleteMyReviewApi(slug);
      const deletedId = myReview?.id;
      setMyReview(null);
      if (deletedId) {
        setPublicReviews((prev) => prev.filter((r) => r?.id !== deletedId));
      }
    } catch (err) {
      console.error(err);
    }
  }, [slug, myReview?.id]);

  if (isCityLoading) return <Loading />;

  if (cityError) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        {cityError}
      </div>
    );
  }

  if (!city) {
    return <div className="text-sm text-slate-600">City not found.</div>;
  }

  const lat = safeNumOrNull(city?.lat);
  const lng = safeNumOrNull(city?.lng);

  const cityLine = [city?.name || "—", city?.state || null]
    .filter(Boolean)
    .join(", ");
  const description =
    city?.description || city?.tagline || "Brief description coming soon";

  const myReviewAction =
    myReviewState === "auth_loading" ||
    myReviewState === "review_loading" ? null : myReviewState ===
      "signed_out" ? (
      <Button onClick={goLoginAndReturn}>Sign in</Button>
    ) : myReviewState === "no_review" ? (
      <Button onClick={() => navigate(`/cities/${slug}/review`)}>
        Write review
      </Button>
    ) : (
      <div />
    );

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete your review?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={executeDelete}
      />

      <BackLink onClick={() => navigate("/cities")}>
        Back to all cities
      </BackLink>

      <PageHero
        title={cityLine}
        description={description}
        aside={
          <>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Overall Livability
            </div>

            <div className="mt-2 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 shadow-sm">
              <Star className="h-5 w-5 text-amber-400" />
              <span className="text-4xl font-semibold text-slate-900 tabular-nums">
                {heroScore == null ? "—" : heroScore.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-slate-600">/10</span>
            </div>
          </>
        }
        asideFooter={`Based on ${stats?.count ?? "—"} reviews & city metrics`}
      />

      <SectionCard
        icon={BarChart3}
        title="Metrics"
        subtitle="Quick city-level indicators used in the livability view."
        action={
          <div className="relative group">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/methodology")}
            >
              <Info className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Learn More</span>
            </Button>
            <div className="pointer-events-none absolute right-0 top-11 z-20 w-64 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Click to learn more about how city metrics are sourced and
              calculated.
            </div>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Safety Score"
            icon={Shield}
            value={fmtOutOf10(metrics?.safetyScore)}
            subtitle="objective (0–10)"
          />
          <MetricCard
            title="Median rent"
            icon={DollarSign}
            value={
              metrics?.medianRent != null ? fmtMoney(metrics.medianRent) : "—"
            }
            subtitle="median rent (proxy)"
          />
          <MetricCard
            title="Population"
            icon={Users}
            value={
              metrics?.population != null
                ? Number(metrics.population).toLocaleString()
                : "—"
            }
            subtitle="latest available"
          />
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Metrics were last synced{" "}
          {fmtDateTime(metrics?.meta?.metricsSync?.syncedAtIso)}
        </div>
      </SectionCard>

      <SectionCard
        icon={MapPin}
        title="Location"
        subtitle="Where this city is on the map."
      >
        {Number.isFinite(lat) && Number.isFinite(lng) ? (
          <CityMap
            cityName={city?.name}
            state={city?.state}
            lat={lat}
            lng={lng}
          />
        ) : (
          <div className="text-sm text-slate-600">
            Map coming soon (missing latitude/longitude for this city).
          </div>
        )}
      </SectionCard>

      <SectionCard
        icon={Star}
        title="Average User Ratings"
        subtitle="Aggregated ratings from all reviews."
      >
        <div className="space-y-4">
          <RatingRow label="Safety" value={avgRatings?.safety} icon={Shield} />
          <RatingRow
            label="Affordability"
            value={avgRatings?.affordability}
            icon={DollarSign}
          />
          <RatingRow
            label="Walkability"
            value={avgRatings?.walkability}
            icon={Car}
          />
          <RatingRow
            label="Cleanliness"
            value={avgRatings?.cleanliness}
            icon={Trash2}
          />
          <RatingRow label="Overall" value={avgRatings?.overall} icon={Star} />
        </div>
      </SectionCard>

      <SectionCard
        icon={BarChart3}
        title="Insights"
        subtitle="How it feels vs what the data says."
      >
        <div className="mt-2 grid gap-3 lg:grid-cols-2">
          <PerceptionVsRealityChart rows={insights.safetyRows} />
          <PerceptionVsRealityChart rows={insights.costRows} />
        </div>
      </SectionCard>

      <SectionCard
        icon={UserIcon}
        title="Your Review"
        subtitle="Your ratings and comment for this city."
        action={myReviewAction}
      >
        {myReviewState === "auth_loading" ? (
          <div className="text-sm text-slate-600">Checking sign-in…</div>
        ) : myReviewState === "signed_out" ? (
          <div className="text-sm text-slate-600">
            Sign in to leave a review for this city.
          </div>
        ) : myReviewState === "review_loading" ? (
          <div className="text-sm text-slate-600">Loading your review…</div>
        ) : myReviewState === "no_review" ? (
          <div className="text-sm text-slate-600">
            You haven’t reviewed this city yet.
          </div>
        ) : (
          <ReviewCard
            review={myReview}
            variant="list"
            title="You"
            editTo={`/cities/${slug}/review`}
            onDelete={deleteMyReview}
          />
        )}
      </SectionCard>

      <SectionCard
        icon={MessageCircle}
        title="Reviews"
        subtitle="Public reviews for this city."
      >
        {isPublicLoading ? (
          <div className="text-sm text-slate-600">Loading reviews…</div>
        ) : null}

        {!isPublicLoading && publicReviewsExcludingMine.length === 0 ? (
          <div className="text-sm text-slate-600">No reviews yet.</div>
        ) : (
          <div className="space-y-4">
            {publicReviewsExcludingMine.map((r, idx) => (
              <ReviewCard
                key={r?.id || `${r?.cityId || slug}__${r?.createdAtIso || idx}`}
                review={r}
                variant="list"
                title="Anonymous"
              />
            ))}
          </div>
        )}

        <div className="pt-4">
          {nextCursor ? (
            <Button onClick={loadMore} variant="secondary" size="default">
              {isLoadingMore ? <Loading /> : "Load more"}
            </Button>
          ) : publicReviewsExcludingMine.length > 0 ? (
            <div className="text-xs text-slate-500">No more reviews.</div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
