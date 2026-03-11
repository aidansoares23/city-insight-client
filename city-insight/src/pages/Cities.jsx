import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Map, GitCompareArrows } from "lucide-react";
import api from "@/services/api";
import CityCard from "@/components/city/CityCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/ui/loading";
import PageHero from "@/components/layout/PageHero";
import SectionCard from "@/components/layout/SectionCard";
import CitiesMap from "@/components/city/CitiesMap";

const MAX_COMPARE = 4;

export default function Cities() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("livability_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState(new Set());

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError("");

    api
      .get("/cities", { params: { limit: 100 } })
      .then((res) => {
        if (!alive) return;
        setCities(res.data?.cities || []);
      })
      .catch((err) => {
        console.error(err);
        if (!alive) return;
        setError("Failed to load cities.");
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let list = query
      ? cities.filter((c) =>
          `${c.name || ""} ${c.state || ""} ${c.slug || ""}`
            .toLowerCase()
            .includes(query),
        )
      : cities;

    const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : null);

    const desc = (a, b) => {
      const av = num(a),
        bv = num(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return bv - av;
    };

    const asc = (a, b) => {
      const av = num(a),
        bv = num(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av - bv;
    };

    switch (sort) {
      case "livability_desc":
        return [...list].sort((a, b) =>
          desc(a.livabilityScore, b.livabilityScore),
        );
      case "safety_desc":
        return [...list].sort((a, b) => desc(a.safetyScore, b.safetyScore));
      case "rent_asc":
        return [...list].sort((a, b) => asc(a.medianRent, b.medianRent));
      case "rent_desc":
        return [...list].sort((a, b) => desc(a.medianRent, b.medianRent));
      case "reviews_desc":
        return [...list].sort((a, b) => desc(a.reviewCount, b.reviewCount));
      case "name_asc":
      default:
        return [...list].sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        );
    }
  }, [cities, q, sort]);

  usePageTitle("Cities");

  function toggleCompareMode() {
    setCompareMode((prev) => {
      if (prev) setSelectedSlugs(new Set());
      return !prev;
    });
  }

  function toggleSelect(slug) {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else if (next.size < MAX_COMPARE) {
        next.add(slug);
      }
      return next;
    });
  }

  function goCompare() {
    if (selectedSlugs.size < 2) return;
    navigate(`/compare?cities=${[...selectedSlugs].join(",")}`);
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PageHero
        title="Explore Cities"
        description="Compare livability, rent, safety, and reviews — side by side."
      />

      <SectionCard
        title="City results"
        subtitle={
          loading
            ? "Loading cities…"
            : error
              ? "Couldn’t load cities."
              : view === "grid"
                ? `${filtered.length} matches`
                : `${cities.length} cities on map`
        }
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {view === "grid" && !compareMode && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Sort</span>
                <select
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200/60"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="livability_desc">Livability: High to low</option>
                  <option value="safety_desc">Safety: High to low</option>
                  <option value="rent_asc">Rent: Low to high</option>
                  <option value="rent_desc">Rent: High to low</option>
                  <option value="reviews_desc">Most reviewed</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>
            )}

            {view === "grid" && !compareMode && (
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by city or state…"
                className="h-10 w-full sm:w-72 bg-white border-slate-300 focus:border-sky-400 focus:ring-sky-400"
              />
            )}

            <div className="flex items-center rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => { setView("grid"); setCompareMode(false); setSelectedSlugs(new Set()); }}
                className={`flex items-center gap-1.5 px-3 h-10 text-sm transition ${
                  view === "grid" && !compareMode
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => { setView("map"); setCompareMode(false); setSelectedSlugs(new Set()); }}
                className={`flex items-center gap-1.5 px-3 h-10 text-sm transition border-l border-slate-200 ${
                  view === "map"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Map className="h-4 w-4" />
                Map
              </button>
              <button
                onClick={() => { setView("grid"); toggleCompareMode(); }}
                className={`flex items-center gap-1.5 px-3 h-10 text-sm transition border-l border-slate-200 ${
                  compareMode
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare
              </button>
            </div>
          </div>
        }
      >
        {compareMode && (
          <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Select 2–{MAX_COMPARE} cities to compare. {selectedSlugs.size > 0 ? `${selectedSlugs.size} selected.` : ""}
          </div>
        )}

        {view === "map" ? (
          <CitiesMap cities={cities} />
        ) : loading ? (
          <Loading />
        ) : error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-600">
            No cities match your search.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-4 sm:pb-6">
            {filtered.map((c) => (
              <CityCard
                key={c.slug}
                city={c}
                compareMode={compareMode}
                selected={selectedSlugs.has(c.slug)}
                onToggle={() => toggleSelect(c.slug)}
                disableToggle={!selectedSlugs.has(c.slug) && selectedSlugs.size >= MAX_COMPARE}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Sticky compare bar */}
      {compareMode && selectedSlugs.size >= 2 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xl">
            <span className="text-sm text-slate-700">
              {selectedSlugs.size} cities selected
            </span>
            <Button onClick={goCompare} size="sm">
              Compare →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
