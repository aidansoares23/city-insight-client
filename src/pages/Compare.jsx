import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "@/services/api";
import { usePageTitle } from "@/hooks/usePageTitle";

import PageHero from "@/components/layout/PageHero";
import { BackLink } from "@/components/ui/back-link";
import SectionCard from "@/components/layout/SectionCard";
import CityRadarChart from "@/components/city/CityRadarChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";

import {
  BarChart3,
  GitCompareArrows,
  Search,
  X,
  Check,
} from "lucide-react";

import { fmtMoney, safeNumOrNull, toOutOf10 } from "@/lib/format";
import { scoreColor } from "@/lib/ratings";
import { cn } from "@/utils/utils";

/** Formats a 0–10 value as "X.X/10" or "—". */
function fmt10(value) {
  const n = safeNumOrNull(value);
  return n == null ? "—" : `${n.toFixed(1)}/10`;
}

/** Colored score badge cell used in the comparison table. */
function ScoreBadge({ value }) {
  const n = safeNumOrNull(value);
  const tone = scoreColor(n);
  if (n == null) return <span className="text-slate-400">—</span>;
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tone.pill)}>
      {n.toFixed(1)}/10
    </span>
  );
}

/** Inline search/typeahead for selecting a city. */
function CitySelector({ allCities, selectedSlug, onSelect, label, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const closeTimer = useRef(null);

  const selectedCity = useMemo(
    () => allCities.find((c) => c.slug === selectedSlug),
    [allCities, selectedSlug],
  );

  // Display value: show city name when selected and not actively searching
  const displayValue = open ? query : selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : "";

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
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
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
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">No cities found.</div>
          ) : (
            filtered.map((city) => (
              <button
                key={city.slug}
                onMouseDown={() => handleSelect(city)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-[hsl(var(--accent))]",
                  city.slug === selectedSlug && "bg-[hsl(var(--secondary))]",
                )}
              >
                <span className="font-medium text-slate-900">
                  {city.name}
                  <span className="ml-1 font-normal text-slate-500">{city.state}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** Comparison table row. */
function CompareRow({ metric, valueA, valueB, winner, renderValue }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 pr-4 text-sm text-slate-600">{metric}</td>
      <td className="py-3 pr-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {renderValue ? renderValue(valueA) : <span className="text-sm font-semibold text-slate-900">{valueA}</span>}
          {winner === "a" && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
        </div>
      </td>
      <td className="py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {renderValue ? renderValue(valueB) : <span className="text-sm font-semibold text-slate-900">{valueB}</span>}
          {winner === "b" && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
        </div>
      </td>
    </tr>
  );
}

/** Determine winner between two numeric values; dir: "higher" or "lower" wins. */
function winner(a, b, dir = "higher") {
  const na = safeNumOrNull(a);
  const nb = safeNumOrNull(b);
  if (na == null || nb == null) return null;
  if (na === nb) return null;
  if (dir === "higher") return na > nb ? "a" : "b";
  return na < nb ? "a" : "b";
}

export default function Compare() {
  usePageTitle("Compare Cities");

  const [searchParams, setSearchParams] = useSearchParams();
  const slugA = searchParams.get("a") || "";
  const slugB = searchParams.get("b") || "";

  const [allCities, setAllCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  const [cityA, setCityA] = useState(null);
  const [cityB, setCityB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState("");
  const [errorB, setErrorB] = useState("");

  const sameCityWarning = slugA && slugB && slugA === slugB;

  // Load all cities for typeahead once on mount
  useEffect(() => {
    api
      .get("/cities?limit=200")
      .then((res) => setAllCities(res.data?.cities || res.data || []))
      .catch(() => {})
      .finally(() => setCitiesLoading(false));
  }, []);

  // Fetch city A details
  useEffect(() => {
    if (!slugA) { setCityA(null); setErrorA(""); return; }
    let alive = true;
    setLoadingA(true);
    setErrorA("");
    api
      .get(`/cities/${slugA}/details`)
      .then((res) => { if (alive) setCityA(res.data); })
      .catch((err) => {
        if (!alive) return;
        setErrorA(err?.response?.status === 404 ? "City not found." : "Failed to load city.");
        setCityA(null);
      })
      .finally(() => { if (alive) setLoadingA(false); });
    return () => { alive = false; };
  }, [slugA]);

  // Fetch city B details
  useEffect(() => {
    if (!slugB) { setCityB(null); setErrorB(""); return; }
    let alive = true;
    setLoadingB(true);
    setErrorB("");
    api
      .get(`/cities/${slugB}/details`)
      .then((res) => { if (alive) setCityB(res.data); })
      .catch((err) => {
        if (!alive) return;
        setErrorB(err?.response?.status === 404 ? "City not found." : "Failed to load city.");
        setCityB(null);
      })
      .finally(() => { if (alive) setLoadingB(false); });
    return () => { alive = false; };
  }, [slugB]);

  const handleSelectA = useCallback((slug) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug) next.set("a", slug); else next.delete("a");
      return next;
    });
  }, [setSearchParams]);

  const handleSelectB = useCallback((slug) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug) next.set("b", slug); else next.delete("b");
      return next;
    });
  }, [setSearchParams]);

  const bothLoaded = cityA && cityB && !sameCityWarning;

  // Derive comparison data
  const aAvg = cityA?.stats?.averages ?? {};
  const bAvg = cityB?.stats?.averages ?? {};
  const aMetrics = cityA?.metrics ?? {};
  const bMetrics = cityB?.metrics ?? {};
  const aLivability = toOutOf10(cityA?.livability?.score ?? cityA?.stats?.livabilityScore);
  const bLivability = toOutOf10(cityB?.livability?.score ?? cityB?.stats?.livabilityScore);

  const tableRows = bothLoaded ? [
    {
      metric: "Livability",
      valueA: aLivability,
      valueB: bLivability,
      win: winner(aLivability, bLivability, "higher"),
      render: (v) => <ScoreBadge value={v} />,
    },
    {
      metric: "Safety (user avg)",
      valueA: aAvg.safety,
      valueB: bAvg.safety,
      win: winner(aAvg.safety, bAvg.safety, "higher"),
      render: (v) => <ScoreBadge value={v} />,
    },
    {
      metric: "Affordability (user avg)",
      valueA: aAvg.affordability,
      valueB: bAvg.affordability,
      win: winner(aAvg.affordability, bAvg.affordability, "higher"),
      render: (v) => <ScoreBadge value={v} />,
    },
    {
      metric: "Walkability (user avg)",
      valueA: aAvg.walkability,
      valueB: bAvg.walkability,
      win: winner(aAvg.walkability, bAvg.walkability, "higher"),
      render: (v) => <ScoreBadge value={v} />,
    },
    {
      metric: "Cleanliness (user avg)",
      valueA: aAvg.cleanliness,
      valueB: bAvg.cleanliness,
      win: winner(aAvg.cleanliness, bAvg.cleanliness, "higher"),
      render: (v) => <ScoreBadge value={v} />,
    },
    {
      metric: "Overall (user avg)",
      valueA: aAvg.overall,
      valueB: bAvg.overall,
      win: winner(aAvg.overall, bAvg.overall, "higher"),
      render: (v) => <ScoreBadge value={v} />,
    },
    {
      metric: "Median Rent",
      valueA: aMetrics.medianRent,
      valueB: bMetrics.medianRent,
      win: winner(aMetrics.medianRent, bMetrics.medianRent, "lower"),
      render: (v) => <span className="text-sm font-semibold text-slate-900">{fmtMoney(v)}</span>,
    },
    {
      metric: "Reviews",
      valueA: cityA?.stats?.count ?? 0,
      valueB: cityB?.stats?.count ?? 0,
      win: null,
      render: (v) => <span className="text-sm text-slate-700">{v ?? 0}</span>,
    },
  ] : [];

  const nameA = cityA ? `${cityA.city?.name}, ${cityA.city?.state}` : "City A";
  const nameB = cityB ? `${cityB.city?.name}, ${cityB.city?.state}` : "City B";

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <BackLink to="/cities">Back to all cities</BackLink>

      <PageHero
        title="Compare Cities"
        description="Select two cities to compare their livability, safety, affordability, and more side by side."
      />

      {/* City selectors */}
      <SectionCard icon={GitCompareArrows} title="Select Cities" subtitle="Search and pick two cities to compare.">
        {citiesLoading ? (
          <Loading label="Loading cities…" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <CitySelector
                allCities={allCities}
                selectedSlug={slugA}
                onSelect={handleSelectA}
                label="City A"
                placeholder="Search city…"
              />
              {errorA && (
                <p className="mt-2 text-xs text-rose-600">{errorA}</p>
              )}
              {loadingA && <div className="mt-2"><Loading label="Loading…" /></div>}
              {cityA && !loadingA && (
                <Link
                  to={`/cities/${slugA}`}
                  className="mt-2 block text-xs text-slate-500 underline-offset-2 hover:underline"
                >
                  View {cityA.city?.name} →
                </Link>
              )}
            </div>

            <div>
              <CitySelector
                allCities={allCities}
                selectedSlug={slugB}
                onSelect={handleSelectB}
                label="City B"
                placeholder="Search city…"
              />
              {errorB && (
                <p className="mt-2 text-xs text-rose-600">{errorB}</p>
              )}
              {loadingB && <div className="mt-2"><Loading label="Loading…" /></div>}
              {cityB && !loadingB && (
                <Link
                  to={`/cities/${slugB}`}
                  className="mt-2 block text-xs text-slate-500 underline-offset-2 hover:underline"
                >
                  View {cityB.city?.name} →
                </Link>
              )}
            </div>
          </div>
        )}

        {sameCityWarning && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Select two different cities to compare.
          </div>
        )}
      </SectionCard>

      {/* Empty state */}
      {!slugA && !slugB && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
          Select two cities above to compare them.
        </div>
      )}

      {/* Radar chart — shown when both cities are loaded */}
      {bothLoaded && (
        <SectionCard
          icon={BarChart3}
          title="Radar Comparison"
          subtitle="All 5 livability dimensions overlaid."
        >
          <CityRadarChart
            averages={aAvg}
            label={cityA.city?.name}
            compareAverages={bAvg}
            compareLabel={cityB.city?.name}
            height={320}
          />
        </SectionCard>
      )}

      {/* Comparison table — shown when both cities are loaded */}
      {bothLoaded && (
        <SectionCard
          icon={GitCompareArrows}
          title="Side-by-Side"
          subtitle="Key metrics compared. ✓ marks the better value where applicable."
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Metric
                  </th>
                  <th className="pb-3 pr-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(199_97%_55%)]" />
                      <span className="max-w-[120px] truncate">{cityA.city?.name}</span>
                    </div>
                  </th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(0_84%_60%)]" />
                      <span className="max-w-[120px] truncate">{cityB.city?.name}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <CompareRow
                    key={row.metric}
                    metric={row.metric}
                    valueA={row.valueA}
                    valueB={row.valueB}
                    winner={row.win}
                    renderValue={row.render}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" asChild>
              <Link to={`/cities/${slugA}`}>View {cityA.city?.name}</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link to={`/cities/${slugB}`}>View {cityB.city?.name}</Link>
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
