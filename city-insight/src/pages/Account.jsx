import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../auth/authContext";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import ReviewCard from "../components/reviews/ReviewCard";
import { usePageTitle } from "../hooks/usePageTitle";
import PageHero from "../components/layout/PageHero";
import { Loading } from "../components/ui/loading";

import { ShieldCheck, Mail, Calendar, Trash2 } from "lucide-react";

import { fmtDateTime } from "@/lib/datetime";
import { initialsFromUser } from "@/lib/format";
import { prettyCityFromSlug } from "@/lib/cities";
import { fetchMyReviews, deleteMyReview } from "@/lib/reviews";

// -----------------------------
// Small UI helpers (kept local)
// -----------------------------
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="grid grid-cols-[20px_1fr] items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
      <div className="min-w-0">
        <div className="font-semibold text-slate-900">{label}</div>
        <div className="truncate text-slate-600">{value}</div>
      </div>
    </div>
  );
}

function Avatar({ user }) {
  const src = user?.picture || user?.photoURL; // support either shape
  if (src) {
    return (
      <img
        src={src}
        alt="Profile"
        className="h-12 w-12 rounded-full border border-slate-200 object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
      {initialsFromUser(user)}
    </div>
  );
}

export default function Account() {
  const { user, loading: authLoading } = useAuth();

  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Page title
  usePageTitle(authLoading ? "Account" : user ? "Account" : "Sign in");

  // -----------------------------
  // Data loading
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setErrorMsg("");
    setReviewsLoading(true);

    fetchMyReviews({ limit: 50 })
      .then((reviews) => {
        if (cancelled) return;
        setMyReviews(reviews);
      })
      .catch((e) => {
        if (cancelled) return;
        setErrorMsg(
          e?.response?.data?.error?.message || "Failed to load reviews",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setReviewsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // -----------------------------
  // Derived stats
  // -----------------------------
  const stats = useMemo(() => {
    const uniqueCities = new Set(
      myReviews.map((r) => r?.cityId).filter(Boolean),
    );
    return {
      reviewCount: myReviews.length,
      citiesReviewed: uniqueCities.size,
    };
  }, [myReviews]);

  // -----------------------------
  // Actions
  // -----------------------------
  const onDeleteReview = useCallback(async (citySlug) => {
    if (!citySlug) return;

    const ok = window.confirm("Delete your review? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteMyReview(citySlug);

      // Optimistic UI update
      setMyReviews((prev) => prev.filter((r) => r?.cityId !== citySlug));
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to delete review.");
    }
  }, []);

  // -----------------------------
  // Render gates
  // -----------------------------
  if (authLoading) return <Loading />;

  if (!user) {
    return <div className="text-sm text-slate-600">Please sign in.</div>;
  }

  // Support either user shape:
  // - legacy: user.metadata.createdAt / lastSignInTime
  // - current: user.createdAt / updatedAt
  const createdAt = user?.metadata?.createdAt ?? user?.createdAt;
  const lastSignIn = user?.metadata?.lastSignInTime ?? user?.updatedAt;

  return (
    <>
      <PageHero
        title="Account"
        description="Manage your profile and reviews."
        aside={
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            Signed in
          </div>
        }
      />

      <div className="space-y-6 animate-in py-6 fade-in slide-in-from-bottom-2 duration-300">
        {/* -----------------------------
            Profile
        ------------------------------ */}
        <Card className="overflow-hidden border-slate-200 bg-white p-0">
          {/* Header */}
          <div className="relative bg-[hsl(var(--secondary))] px-6 py-6">
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-slate-900/5" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900">
                  Profile
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Your account details and activity snapshot.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <CardContent className="bg-white px-6 py-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              {/* Identity */}
              <div className="flex min-w-0 items-start gap-4">
                <div className="shrink-0">
                  <Avatar user={user} />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-slate-900">
                    {user?.displayName || "Unnamed user"}
                  </div>
                  <div className="truncate text-sm text-slate-600">
                    {user?.email || "—"}
                  </div>

                  {/* Quick stats */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {stats.citiesReviewed}{" "}
                      {stats.citiesReviewed === 1 ? "city" : "cities"} reviewed
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid w-full gap-3 sm:max-w-sm">
                <InfoRow icon={Mail} label="Email" value={user?.email || "—"} />
                <InfoRow
                  icon={ShieldCheck}
                  label="Email verified"
                  value={user?.emailVerified ? "Yes" : "No"}
                />
                <InfoRow
                  icon={Calendar}
                  label="Created"
                  value={fmtDateTime(createdAt)}
                />
                <InfoRow
                  icon={Calendar}
                  label="Last sign-in"
                  value={fmtDateTime(lastSignIn)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* -----------------------------
            Your Reviews
        ------------------------------ */}
        <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-l transition-transform duration-200 hover:-translate-y-0.5">
          {/* Header */}
          <div className="relative bg-[hsl(var(--secondary))] px-6 py-6">
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-slate-900/5" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900">
                  Your Reviews
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  View, edit, and delete all of your reviews.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <CardContent className="bg-white px-6 py-5">
            {reviewsLoading ? (
              <div className="text-sm text-slate-600">Loading reviews…</div>
            ) : null}

            {errorMsg ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {errorMsg}
              </div>
            ) : null}

            {!reviewsLoading && !errorMsg && myReviews.length === 0 ? (
              <Card className="border-slate-200/70 shadow-sm ring-1 ring-blue-100/30">
                <CardContent className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <span className="inline-block h-5 w-1 rounded-full bg-blue-500/60" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-900">
                        No reviews yet.
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Leave a city review and it’ll show up here.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {!reviewsLoading && !errorMsg && myReviews.length > 0 ? (
              <div className="space-y-3">
                {myReviews.map((review, idx) => {
                  const citySlug = review?.cityId || "unknown-city";
                  const key =
                    review?.id ||
                    `${citySlug}__${review?.updatedAtIso || review?.createdAtIso || idx}`;

                  const cityLabel =
                    review?.cityName ||
                    review?.cityLabel ||
                    prettyCityFromSlug(citySlug);

                  return (
                    <ReviewCard
                      key={key}
                      review={review}
                      variant="account"
                      title="You"
                      showCity
                      cityLabel={cityLabel}
                      editTo={`/cities/${citySlug}/review`}
                      editState={{ returnTo: "/account" }}
                      onDelete={() => onDeleteReview(citySlug)}
                    />
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* -----------------------------
            Danger Zone
        ------------------------------ */}
        <Card className="border-slate-200/70 bg-white shadow-black-xl ring-1 ring-rose-100/40">
          <CardContent className="px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-base font-semibold text-slate-900">
                  Delete Your Account
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Permanently delete your account and associated data.
                </div>
              </div>

              <Button
                variant="danger"
                onClick={() => alert("Account deletion is not enabled yet.")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
