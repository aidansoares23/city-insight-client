import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "@/services/api";
import { usePageTitle } from "@/hooks/usePageTitle";

import CityRadarChart from "@/components/city/CityRadarChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { fetchAllCities } from "@/lib/cities";
import PageHero from "@/components/layout/PageHero";

import {
  BarChart3,
  GitCompareArrows,
  Search,
  X,
  Check,
  Plus,
  DollarSign,
} from "lucide-react";
import CostCalculator from "@/components/city/CostCalculator";

import { fmtMoney, safeNumOrNull, toOutOf10 } from "@/lib/format";
import { scoreColor } from "@/lib/ratings";
import { cn } from "@/utils/utils";

const PARAM_KEYS = ["a", "b", "c", "d"];
const MAX_CITIES = 4;
const MIN_CITIES = 2;

// Dot classes and strokes match --chart-1/2/3/4 tokens in theme.css
const CITY_COLORS = [
  { dot: "bg-[hsl(var(--chart-1))]", stroke: "hsl(199 97% 55%)" },
  { dot: "bg-[hsl(var(--chart-2))]", stroke: "hsl(0 84% 60%)" },
  { dot: "bg-[hsl(var(--chart-3))]", stroke: "hsl(142 72% 45%)" },
  { dot: "bg-[hsl(var(--chart-4))]", stroke: "hsl(38 92% 50%)" },
];

function ScoreBadge({ value }) {
  const n = safeNumOrNull(value);
  const tone = scoreColor(n);
  if (n == null) return <span className="text-slate-400">N/A</span>;
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone.pill,
      )}
    >
      {n.toFixed(1)}/10
    </span>
  );
}

function LivabilityBadge({ value }) {
  const n = safeNumOrNull(value);
  const tone = scoreColor(toOutOf10(n));
  if (n == null) return <span className="text-slate-400">N/A</span>;
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone.pill,
      )}
    >
      {Math.round(n)}/100
    </span>
  );
}

/** Inline city search typeahead. */
function CitySelector({ allCities, selectedSlug, onSelect, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const closeTimer = useRef(null);

  const selectedCity = useMemo(
    () => allCities.find((c) => c.slug === selectedSlug),
    [allCities, selectedSlug],
  );

  const displayValue = open
    ? query
    : selectedCity
      ? `${selectedCity.name}, ${selectedCity.state}`
      : "";

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allCities.slice(0, 8);
    return allCities
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.state?.toLowerCase().includes(q) ||
          c.slug?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [allCities, query]);

  const handleSelect = (city) => {
    setQuery("");
    setOpen(false);
    onSelect(city.slug);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuery("");
    onSelect("");
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    clearTimeout(closeTimer.current);
    setQuery("");
    setOpen(true);
  };

  const handleBlur = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-9 pr-8"
        />
        {selectedSlug && !open && (
          <button
            onMouseDown={handleClear}
            className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-400 bg-white shadow-md">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No cities found.
            </div>
          ) : (
            filtered.map((city) => (
              <button
                key={city.slug}
                onMouseDown={() => handleSelect(city)}
                className={cn(
                  "flex w-full items-center px-4 py-2.5 text-left text-sm hover:bg-[hsl(var(--accent))]",
                  city.slug === selectedSlug && "bg-[hsl(var(--secondary))]",
                )}
              >
                <span className="font-medium text-slate-900">
                  {city.name}
                  <span className="ml-1 font-normal text-slate-500">
                    {city.state}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** Returns the index of the best value, or null on tie / insufficient data. */
function findWinner(values, dir = "higher") {
  const nums = values.map((v) => safeNumOrNull(v));
  const valid = nums.filter((n) => n != null);
  if (valid.length < 2) return null;
  const best = dir === "higher" ? Math.max(...valid) : Math.min(...valid);
  if (nums.filter((n) => n === best).length > 1) return null; // tie
  return nums.findIndex((n) => n === best);
}

function CompareRow({ metric, values, winnerIdx, renderValue }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 pr-4 text-sm text-slate-600 whitespace-nowrap">
        {metric}
      </td>
      {values.map((value, i) => (
        <td key={i} className="py-3 pr-2 text-center" style={{ minWidth: 100 }}>
          <div className="flex items-center justify-center gap-1.5">
            {renderValue ? (
              renderValue(value)
            ) : (
              <span className="text-sm font-semibold text-slate-900">
                {value}
              </span>
            )}
            {winnerIdx === i && (
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            )}
          </div>
        </td>
      ))}
    </tr>
  );
}

export default function Compare() {
  usePageTitle("Compare Cities");

  const [searchParams, setSearchParams] = useSearchParams();

  // Slot count (2–4), initialised from URL
  const [slotCount, setSlotCount] = useState(() => {
    let count = MIN_CITIES;
    for (let i = MIN_CITIES; i < PARAM_KEYS.length; i++) {
      if (searchParams.get(PARAM_KEYS[i])) count = i + 1;
    }
    return count;
  });

  const slugs = PARAM_KEYS.slice(0, slotCount).map(
    (k) => searchParams.get(k) || "",
  );
  const slugKey = slugs.join(",");

  const [allCities, setAllCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [allCitiesError, setAllCitiesError] = useState(false);

  // Per-slot state (indexed 0–3)
  const [cityData, setCityData] = useState(Array(MAX_CITIES).fill(null));
  const [loadingStates, setLoadingStates] = useState(
    Array(MAX_CITIES).fill(false),
  );
  const [errorStates, setErrorStates] = useState(Array(MAX_CITIES).fill(""));

  // Load all cities once for the typeahead
  useEffect(() => {
    fetchAllCities()
      .then((list) => setAllCities(list))
      .catch(() => setAllCitiesError(true))
      .finally(() => setCitiesLoading(false));
  }, []);

  // Fetch details for each active slot
  useEffect(() => {
    const aliveFlags = Array.from({ length: slotCount }, () => ({
      alive: true,
    }));

    slugs.forEach((slug, i) => {
      if (!slug) {
        setCityData((prev) => {
          const n = [...prev];
          n[i] = null;
          return n;
        });
        setErrorStates((prev) => {
          const n = [...prev];
          n[i] = "";
          return n;
        });
        return;
      }

      setLoadingStates((prev) => {
        const n = [...prev];
        n[i] = true;
        return n;
      });
      setErrorStates((prev) => {
        const n = [...prev];
        n[i] = "";
        return n;
      });

      api
        .get(`/cities/${slug}/details`)
        .then((res) => {
          if (!aliveFlags[i].alive) return;
          setCityData((prev) => {
            const n = [...prev];
            n[i] = res.data;
            return n;
          });
        })
        .catch((err) => {
          if (!aliveFlags[i].alive) return;
          setErrorStates((prev) => {
            const n = [...prev];
            n[i] =
              err?.response?.status === 404
                ? "City not found."
                : "Failed to load city.";
            return n;
          });
          setCityData((prev) => {
            const n = [...prev];
            n[i] = null;
            return n;
          });
        })
        .finally(() => {
          if (!aliveFlags[i].alive) return;
          setLoadingStates((prev) => {
            const n = [...prev];
            n[i] = false;
            return n;
          });
        });
    });

    return () => {
      aliveFlags.forEach((f) => {
        f.alive = false;
      });
    };
  }, [slugKey, slotCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback(
    (index, slug) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (slug) next.set(PARAM_KEYS[index], slug);
        else next.delete(PARAM_KEYS[index]);
        return next;
      });
    },
    [setSearchParams],
  );

  const addSlot = () => setSlotCount((c) => Math.min(c + 1, MAX_CITIES));

  const removeSlot = (index) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      // Shift remaining slugs down to fill the gap
      for (let i = index; i < slotCount - 1; i++) {
        const val = next.get(PARAM_KEYS[i + 1]);
        if (val) next.set(PARAM_KEYS[i], val);
        else next.delete(PARAM_KEYS[i]);
      }
      next.delete(PARAM_KEYS[slotCount - 1]);
      return next;
    });
    setCityData((prev) => {
      const n = [...prev];
      n.splice(index, 1);
      n.push(null);
      return n;
    });
    setSlotCount((c) => Math.max(c - 1, MIN_CITIES));
  };

  const activeSlugs = slugs.filter(Boolean);
  const hasDuplicates = activeSlugs.length !== new Set(activeSlugs).size;

  // Only cities that have fully loaded
  const loadedCities = slugs
    .map((slug, i) => ({ slug, data: cityData[i], color: CITY_COLORS[i] }))
    .filter((c) => c.slug && c.data);

  const canShowResults = loadedCities.length >= 2 && !hasDuplicates;

  const radarCities = loadedCities.map((c) => ({
    averages: c.data?.stats?.averages ?? {},
    label: c.data?.city?.name || "",
    color: c.color.stroke,
  }));

  const tableRows = canShowResults
    ? [
        {
          metric: "Livability Score",
          values: loadedCities.map(
            (c) =>
              c.data?.livability?.score ??
              c.data?.stats?.livabilityScore ??
              null,
          ),
          dir: "higher",
          render: (v) => <LivabilityBadge value={v} />,
        },
        {
          metric: "Safety",
          values: loadedCities.map((c) => c.data?.stats?.averages?.safety),
          dir: "higher",
          render: (v) => <ScoreBadge value={v} />,
        },
        {
          metric: "Affordability",
          values: loadedCities.map(
            (c) => c.data?.stats?.averages?.affordability,
          ),
          dir: "higher",
          render: (v) => <ScoreBadge value={v} />,
        },
        {
          metric: "Walkability",
          values: loadedCities.map((c) => c.data?.stats?.averages?.walkability),
          dir: "higher",
          render: (v) => <ScoreBadge value={v} />,
        },
        {
          metric: "Cleanliness",
          values: loadedCities.map((c) => c.data?.stats?.averages?.cleanliness),
          dir: "higher",
          render: (v) => <ScoreBadge value={v} />,
        },
        {
          metric: "Overall Rating",
          values: loadedCities.map((c) => c.data?.stats?.averages?.overall),
          dir: "higher",
          render: (v) => <ScoreBadge value={v} />,
        },
        {
          metric: "Median Rent",
          values: loadedCities.map((c) => c.data?.metrics?.medianRent),
          dir: "lower",
          render: (v) => (
            <span className="text-sm font-semibold text-slate-900">
              {fmtMoney(v)}
            </span>
          ),
        },
        {
          metric: "Air Quality (AQI)",
          values: loadedCities.map((c) => c.data?.metrics?.aqiValue ?? null),
          dir: "lower",
          render: (v) => (
            <span className="text-sm font-semibold text-slate-900">
              {v != null ? `${v} AQI` : "N/A"}
            </span>
          ),
        },
        {
          metric: "Reviews",
          values: loadedCities.map((c) => c.data?.stats?.count ?? 0),
          dir: null,
          render: (v) => (
            <span className="text-sm text-slate-900">{v ?? 0}</span>
          ),
        },
      ]
    : [];

  const selectorCols =
    slotCount === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : slotCount === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PageHero
        title="Compare Cities"
        description="Pick two to four cities and see how they stack up — ratings, rent, and more, all side by side."
      />

      {/* City selectors */}
      <div className="rounded-lg border border-slate-400 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Choose Your Cities
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Add up to {MAX_CITIES} cities to compare.
        </p>
        <div className="mt-3">
          {citiesLoading ? (
            <Loading label="Loading cities…" />
          ) : allCitiesError ? (
            <ErrorMessage message="Could not load city list. Please refresh to try again." />
          ) : (
            <div className={`grid gap-4 ${selectorCols}`}>
              {slugs.map((slug, i) => (
                <div key={i}>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${CITY_COLORS[i].dot}`}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      City {i + 1}
                    </span>
                    {i >= MIN_CITIES && (
                      <button
                        onClick={() => removeSlot(i)}
                        className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label={`Remove city ${i + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <CitySelector
                    allCities={allCities}
                    selectedSlug={slug}
                    onSelect={(s) => handleSelect(i, s)}
                    placeholder="Search for a city…"
                  />

                  {errorStates[i] && (
                    <p className="mt-2 text-xs text-rose-600">
                      {errorStates[i]}
                    </p>
                  )}
                  {loadingStates[i] && (
                    <div className="mt-2">
                      <Loading label="Loading…" />
                    </div>
                  )}
                  {cityData[i] && !loadingStates[i] && (
                    <Link
                      to={`/cities/${slug}`}
                      className="mt-2 block text-xs text-slate-500 underline-offset-2 hover:underline"
                    >
                      View {cityData[i].city?.name} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {slotCount < MAX_CITIES && (
            <button
              onClick={addSlot}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))]">
                <Plus className="h-3 w-3 text-slate-900" />
              </span>
              Add another city
            </button>
          )}

          {hasDuplicates && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You've picked the same city more than once — each slot should be a
              different city.
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {activeSlugs.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-400 bg-white px-6 py-10 text-center text-sm text-slate-400">
          Search for cities above to start comparing.
        </div>
      )}

      {/* Radar chart */}
      {canShowResults && (
        <div className="rounded-lg border border-slate-400 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Score Overview
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            How each city rates across all categories.
          </p>
          <div className="mt-3">
            <CityRadarChart cities={radarCities} height={320} />
          </div>
        </div>
      )}

      {/* Comparison table */}
      {canShowResults && (
        <div className="rounded-lg border border-slate-400 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Side-by-Side Breakdown
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            ✓ marks the best city for each category.
          </p>
          <div className="mt-3">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-400">
                    <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Category
                    </th>
                    {loadedCities.map((c, i) => (
                      <th
                        key={i}
                        className="pb-3 pr-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                        style={{ minWidth: 100 }}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${c.color.dot}`}
                          />
                          <span className="max-w-[100px] truncate">
                            {c.data?.city?.name}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <CompareRow
                      key={row.metric}
                      metric={row.metric}
                      values={row.values}
                      winnerIdx={
                        row.dir ? findWinner(row.values, row.dir) : null
                      }
                      renderValue={row.render}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
              {loadedCities.map((c, i) => (
                <Button key={i} variant="secondary" size="sm" asChild>
                  <Link to={`/cities/${c.slug}`} state={{ from: "compare" }}>
                    View {c.data?.city?.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Moving Cost Calculator */}
      {canShowResults && (
        <div className="rounded-lg border border-slate-400 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Moving Cost Estimate
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Monthly budget comparison based on median rent ratios.
          </p>
          <div className="mt-3">
            <CostCalculator cities={loadedCities} />
          </div>
        </div>
      )}
    </div>
  );
}
