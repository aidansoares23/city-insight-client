import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/authContext";

import { Button } from "@/components/ui/button.jsx";
import { ConfirmDialog } from "@/components/ui/dialog.jsx";
import ReviewCard from "@/components/reviews/ReviewCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import PageHero from "@/components/layout/PageHero";
import { Loading } from "@/components/ui/loading.jsx";
import ErrorMessage from "@/components/ui/ErrorMessage.jsx";

import {
  Pencil,
  ShieldCheck,
  Mail,
  Calendar,
  Trash2,
  Heart,
  Check,
  X,
} from "lucide-react";

import { fmtDateTime } from "@/lib/datetime";
import { initialsFromUser } from "@/lib/format";
import { prettyCityFromSlug } from "@/lib/cities";
import { fetchMyReviews, deleteMyReview, deleteMyAccount } from "@/lib/reviews";
import { fetchMyFavorites, removeFavorite } from "@/lib/favorites";
import { updateMyProfile } from "@/lib/me";
import { sanitizeDisplayName } from "@/lib/sanitize";
import { RATING_KEYS, scoreColor, derivedOverall } from "@/lib/ratings";

/** Labelled info row with an icon for displaying user profile fields. */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="grid grid-cols-[20px_1fr] items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
      <div className="min-w-0">
        <div className="font-semibold text-slate-900">{label}</div>
        <div className="truncate text-slate-500">{value}</div>
      </div>
    </div>
  );
}

/** Renders the user's profile picture, or a fallback initials circle if no picture is set. */
function Avatar({ user }) {
  const src = user?.picture;
  if (src) {
    return (
      <img
        src={src}
        alt="Profile"
        className="h-12 w-12 rounded-full border border-slate-400 object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-400 bg-white text-sm font-semibold text-slate-900">
      {initialsFromUser(user)}
    </div>
  );
}

/** User account page showing profile info, review list with edit/delete, and an account-deletion option. */
export default function Account() {
  const { user, loading: authLoading, logout, refreshSessionUser } = useAuth();

  const [myReviews, setMyReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteSlug, setPendingDeleteSlug] = useState(null);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const [myFavorites, setMyFavorites] = useState([]);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");
  const [unfavoriteLoadingSlug, setUnfavoriteLoadingSlug] = useState(null);

  // Inline display name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const nameInputRef = useRef(null);

  // Review sort
  const [reviewSort, setReviewSort] = useState("newest");

  usePageTitle(authLoading ? "Account" : user ? "Account" : "Sign in");

  useEffect(() => {
    if (!user) return;

    let alive = true;
    setError("");
    setIsReviewsLoading(true);

    fetchMyReviews({ limit: 50 })
      .then((reviews) => {
        if (alive) setMyReviews(reviews);
      })
      .catch((e) => {
        console.error(e);
        if (alive)
          setError(
            e?.response?.data?.error?.message || "Failed to load reviews",
          );
      })
      .finally(() => {
        if (alive) setIsReviewsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let alive = true;
    setFavoritesError("");
    setIsFavoritesLoading(true);

    fetchMyFavorites()
      .then((favorites) => {
        if (alive) setMyFavorites(favorites);
      })
      .catch((e) => {
        console.error(e);
        if (alive)
          setFavoritesError(
            e?.response?.data?.error?.message || "Failed to load favorites",
          );
      })
      .finally(() => {
        if (alive) setIsFavoritesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user]);

  // Focus input when entering name edit mode
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const citiesReviewed = useMemo(() => {
    const uniqueCities = new Set(
      myReviews.map((review) => review?.cityId).filter(Boolean),
    );
    return uniqueCities.size;
  }, [myReviews]);

  // Stats derived from reviews
  const reviewStats = useMemo(() => {
    if (myReviews.length === 0) return null;
    const avgs = {};
    for (const key of RATING_KEYS) {
      const vals = myReviews
        .map((r) => r?.ratings?.[key])
        .filter((v) => v != null);
      avgs[key] = vals.length
        ? vals.reduce((a, b) => a + b, 0) / vals.length
        : null;
    }
    const mostRecent =
      myReviews[0]?.updatedAt ?? myReviews[0]?.createdAt ?? null;
    return { avgs, mostRecent, total: myReviews.length };
  }, [myReviews]);

  // Sorted reviews
  const sortedReviews = useMemo(() => {
    const copy = [...myReviews];
    switch (reviewSort) {
      case "oldest":
        return copy.sort((a, b) =>
          (a.createdAt ?? "") < (b.createdAt ?? "") ? -1 : 1,
        );
      case "city":
        return copy.sort((a, b) =>
          (a.cityId ?? "").localeCompare(b.cityId ?? ""),
        );
      case "highest":
        return copy.sort(
          (a, b) => derivedOverall(b.ratings) - derivedOverall(a.ratings),
        );
      case "lowest":
        return copy.sort(
          (a, b) => derivedOverall(a.ratings) - derivedOverall(b.ratings),
        );
      default:
        return copy; // newest — API already returns newest first
    }
  }, [myReviews, reviewSort]);

  const onDeleteReview = useCallback((citySlug) => {
    if (!citySlug) return;
    setPendingDeleteSlug(citySlug);
    setDeleteConfirmOpen(true);
  }, []);

  const onConfirmDelete = useCallback(async () => {
    if (!pendingDeleteSlug) return;
    try {
      await deleteMyReview(pendingDeleteSlug);
      setMyReviews((prev) =>
        prev.filter((review) => review?.cityId !== pendingDeleteSlug),
      );
    } catch (e) {
      console.error(e);
      setError("Failed to delete review.");
    } finally {
      setPendingDeleteSlug(null);
    }
  }, [pendingDeleteSlug]);

  const onConfirmDeleteAccount = useCallback(async () => {
    try {
      await deleteMyAccount();
      await logout();
    } catch (e) {
      console.error(e);
      setError("Failed to delete account.");
    }
  }, [logout]);

  const onUnfavorite = useCallback(async (citySlug) => {
    if (!citySlug) return;
    setUnfavoriteLoadingSlug(citySlug);
    try {
      await removeFavorite(citySlug);
      setMyFavorites((prev) => prev.filter((f) => f.cityId !== citySlug));
    } catch (e) {
      console.error(e);
      setFavoritesError("Failed to remove favorite.");
    } finally {
      setUnfavoriteLoadingSlug(null);
    }
  }, []);

  function startEditName() {
    setNameValue(user?.displayName || "");
    setNameError("");
    setEditingName(true);
  }

  async function commitNameEdit() {
    const result = sanitizeDisplayName(nameValue);
    if (!result.ok) {
      setNameError(result.error);
      return;
    }
    const trimmed = result.value;
    if (trimmed === user?.displayName) {
      setEditingName(false);
      return;
    }
    setNameSaving(true);
    setNameError("");
    try {
      await updateMyProfile({ displayName: trimmed });
      await refreshSessionUser();
      setEditingName(false);
    } catch (e) {
      console.error(e);
      setNameError(
        e?.response?.data?.error?.message || "Failed to update name.",
      );
    } finally {
      setNameSaving(false);
    }
  }

  function cancelNameEdit() {
    setEditingName(false);
    setNameError("");
  }

  function handleNameKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitNameEdit();
    } else if (e.key === "Escape") {
      cancelNameEdit();
    }
  }

  if (authLoading) return <Loading />;

  if (!user) {
    return <div className="text-sm text-slate-600">Please sign in.</div>;
  }

  // Support either user shape:
  // - legacy: user.metadata.createdAt / lastSignInTime
  // - current: user.createdAt / updatedAt
  const createdAt = user.metadata?.createdAt ?? user.createdAt;
  const lastSignIn = user.metadata?.lastSignInTime ?? user.updatedAt;

  return (
    <>
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete review?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={onConfirmDelete}
      />
      <ConfirmDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title="Delete your account?"
        description="This will permanently delete your account and all your reviews. This cannot be undone."
        confirmLabel="Delete account"
        onConfirm={onConfirmDeleteAccount}
        requireConfirmText="delete my account"
      />

      <PageHero
        title="Account"
        description="Manage your profile and reviews."
        nav={[
          { href: "#profile", label: "Profile" },
          { href: "#reviews", label: "Reviews" },
          { href: "#favorites", label: "Favorites" },
        ]}
      />

      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div
          id="profile"
          className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
        >
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Profile
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your account details and activity snapshot.
          </p>
          <div className="mt-3">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="shrink-0">
                  <Avatar user={user} />
                </div>

                <div className="min-w-0">
                  {/* Inline display name editor */}
                  {editingName ? (
                    <div className="space-y-1.5">
                      <div className="flex flex-col gap-2">
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={nameValue}
                          onChange={(e) => {
                            setNameValue(e.target.value);
                            setNameError("");
                          }}
                          onKeyDown={handleNameKeyDown}
                          maxLength={50}
                          disabled={nameSaving}
                          className="w-full rounded-md border border-slate-400 px-2 py-1 text-base font-semibold text-slate-900 outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/30 disabled:opacity-50"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={commitNameEdit}
                            disabled={nameSaving}
                            aria-label="Save name"
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelNameEdit}
                            disabled={nameSaving}
                            aria-label="Cancel"
                            className="inline-flex items-center gap-1 rounded-md border border-slate-400 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                      {nameError && (
                        <p className="text-xs text-rose-600">{nameError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="truncate text-base font-semibold text-slate-900">
                        {user.displayName || "Unnamed user"}
                      </div>
                      <button
                        type="button"
                        onClick={startEditName}
                        aria-label="Edit display name"
                        className="shrink-0 inline-flex items-center gap-1 rounded-md border border-slate-400 bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                  )}
                  <div className="truncate text-sm text-slate-600">
                    {user.email || "N/A"}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900">
                      {citiesReviewed}{" "}
                      {citiesReviewed === 1 ? "city" : "cities"} reviewed
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid w-full gap-3 sm:max-w-sm">
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={user.email || "N/A"}
                />
                <InfoRow
                  icon={ShieldCheck}
                  label="Email verified"
                  value={user.emailVerified ? "Yes" : "No"}
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
          </div>
        </div>

        {/* Stats — shown only once reviews are loaded and at least one exists */}
        {!isReviewsLoading && reviewStats ? (
          <div className="rounded-lg border border-slate-400 bg-white px-5 py-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Your Stats
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Average ratings you've given across all {reviewStats.total}{" "}
              {reviewStats.total === 1 ? "review" : "reviews"}.
            </p>
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {RATING_KEYS.map((key) => {
                  const avg = reviewStats.avgs[key];
                  const rounded =
                    avg != null ? Math.round(avg * 10) / 10 : null;
                  const { bar: barClass } = scoreColor(rounded);
                  return (
                    <div
                      key={key}
                      className="flex flex-col gap-2 rounded-lg border border-slate-400 bg-slate-50 px-4 py-3"
                    >
                      <div className="text-xs font-semibold capitalize text-slate-500">
                        {key}
                      </div>
                      <div className="text-2xl font-bold tabular-nums text-slate-900">
                        {rounded ?? "N/A"}
                        <span className="text-sm font-normal text-slate-400">
                          /10
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${barClass}`}
                          style={{ width: `${((rounded ?? 0) / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {reviewStats.mostRecent ? (
                <p className="mt-4 text-xs text-slate-500">
                  Most recent review:{" "}
                  <span className="font-medium text-slate-900">
                    {fmtDateTime(reviewStats.mostRecent)}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          id="reviews"
          className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
        >
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Your Reviews
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View, edit, and delete all of your reviews.
          </p>
          <div className="mt-3">
            {isReviewsLoading ? <Loading label="Loading reviews…" /> : null}

            {error ? <ErrorMessage message={error} /> : null}

            {!isReviewsLoading && !error && myReviews.length === 0 ? (
              <div className="text-sm text-slate-500">
                No reviews yet. Leave a city review and it'll show up here.
              </div>
            ) : null}

            {!isReviewsLoading && !error && myReviews.length > 0 ? (
              <div className="space-y-3">
                {myReviews.length > 1 ? (
                  <div className="flex items-center justify-end gap-2">
                    <label
                      htmlFor="review-sort"
                      className="text-xs font-medium text-slate-500"
                    >
                      Sort by
                    </label>
                    <select
                      id="review-sort"
                      value={reviewSort}
                      onChange={(e) => setReviewSort(e.target.value)}
                      className="rounded-md border border-slate-400 bg-white px-2 py-1 text-xs font-medium text-slate-600 outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/30"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="city">City A–Z</option>
                      <option value="highest">Highest rated</option>
                      <option value="lowest">Lowest rated</option>
                    </select>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  {sortedReviews.map((review, index) => {
                    const citySlug = review?.cityId || "unknown-city";
                    const key =
                      review?.id ||
                      `${citySlug}__${review?.updatedAt ?? review?.updatedAtIso ?? review?.createdAt ?? review?.createdAtIso ?? index}`;

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
              </div>
            ) : null}
          </div>
        </div>

        <div
          id="favorites"
          className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
        >
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Favorite Cities
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Cities you've saved for easy access.
          </p>
          <div className="mt-3">
            {isFavoritesLoading ? <Loading label="Loading favorites…" /> : null}

            {favoritesError ? <ErrorMessage message={favoritesError} /> : null}

            {!isFavoritesLoading &&
            !favoritesError &&
            myFavorites.length === 0 ? (
              <div className="text-sm text-slate-500">
                No favorites yet. Favorite a city on its detail page and it'll
                appear here.
              </div>
            ) : null}

            {!isFavoritesLoading &&
            !favoritesError &&
            myFavorites.length > 0 ? (
              <div className="space-y-2">
                {myFavorites.map((fav) => {
                  const slug = fav.cityId;
                  const label = prettyCityFromSlug(slug);
                  const isRemoving = unfavoriteLoadingSlug === slug;
                  return (
                    <div
                      key={slug}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-400 bg-slate-50 px-4 py-3"
                    >
                      <Link
                        to={`/cities/${slug}`}
                        className="min-w-0 truncate text-sm font-semibold text-slate-900 underline-offset-2 hover:underline"
                      >
                        {label}
                      </Link>
                      <button
                        onClick={() => onUnfavorite(slug)}
                        disabled={isRemoving}
                        aria-label={`Remove ${label} from favorites`}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-50"
                      >
                        <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                        {isRemoving ? "Removing…" : "Unfavorite"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-400 bg-white px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">
                Delete Your Account
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Permanently delete your account and associated data.
              </div>
            </div>
            <Button variant="danger" onClick={() => setDeleteAccountOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete account
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
