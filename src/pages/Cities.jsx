import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Map, Search, X } from "lucide-react";
import CityCard from "@/components/city/CityCard";
import { Input } from "@/components/ui/Input";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/ui/Loading";
import ErrorMessage from "@/components/ui/ErrorMessage";
import CitiesMap from "@/components/city/CitiesMap";
import { fetchAllCities } from "@/lib/cities";
import PageHero from "@/components/layout/PageHero";

function toNum(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function sortDesc(a, b) {
  const aNum = toNum(a), bNum = toNum(b);
  if (aNum == null && bNum == null) return 0;
  if (aNum == null) return 1;
  if (bNum == null) return -1;
  return bNum - aNum;
}

function sortAsc(a, b) {
  const aNum = toNum(a), bNum = toNum(b);
  if (aNum == null && bNum == null) return 0;
  if (aNum == null) return 1;
  if (bNum == null) return -1;
  return aNum - bNum;
}

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("livability_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");
  const searchRef = useRef(null);

  useEffect(() => {
    let alive = true;

    fetchAllCities()
      .then((list) => {
        if (!alive) return;
        setCities(list);
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
    const query = searchInput.trim().toLowerCase();

    let list = query
      ? cities.filter((city) =>
          `${city.name || ""} ${city.state || ""} ${city.slug || ""}`
            .toLowerCase()
            .includes(query),
        )
      : cities;

    switch (sort) {
      case "livability_desc":
        return [...list].sort((a, b) => sortDesc(a.livabilityScore, b.livabilityScore));
      case "livability_asc":
        return [...list].sort((a, b) => sortAsc(a.livabilityScore, b.livabilityScore));
      case "safety_desc":
        return [...list].sort((a, b) => sortDesc(a.safetyScore, b.safetyScore));
      case "safety_asc":
        return [...list].sort((a, b) => sortAsc(a.safetyScore, b.safetyScore));
      case "rent_asc":
        return [...list].sort((a, b) => sortAsc(a.medianRent, b.medianRent));
      case "rent_desc":
        return [...list].sort((a, b) => sortDesc(a.medianRent, b.medianRent));
      case "population_desc":
        return [...list].sort((a, b) => sortDesc(a.population, b.population));
      case "population_asc":
        return [...list].sort((a, b) => sortAsc(a.population, b.population));
      case "reviews_desc":
        return [...list].sort((a, b) => sortDesc(a.reviewCount, b.reviewCount));
      case "reviews_asc":
        return [...list].sort((a, b) => sortAsc(a.reviewCount, b.reviewCount));
      case "name_desc":
        return [...list].sort((a, b) =>
          String(b.name || "").localeCompare(String(a.name || "")),
        );
      case "name_asc":
      default:
        return [...list].sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        );
    }
  }, [cities, searchInput, sort]);

  usePageTitle("Cities");

  const resultsLabel = loading
    ? "Loading cities…"
    : error
      ? "Couldn't load cities."
      : view === "grid"
        ? `${filtered.length} matches`
        : searchInput.trim()
          ? `${filtered.length} of ${cities.length} cities`
          : `${cities.length} cities on map`;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PageHero
        title="Explore Cities"
        description="Compare livability, rent, safety, and reviews — side by side."
      />

      {/* Search + view toggle row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          <Input
            ref={searchRef}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by city or state…"
            className={`h-9 rounded-lg border-slate-400 bg-white pl-9 text-sm shadow-sm focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 ${searchInput ? "pr-8" : ""}`}
            onFocus={() => {
              if (window.innerWidth >= 640) {
                searchRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
            }}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex w-fit items-center overflow-hidden rounded-md border border-slate-400 bg-white shadow-sm">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1 px-2.5 h-9 text-xs transition ${
              view === "grid" ? "bg-[hsl(var(--primary))] text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1 px-2.5 h-9 text-xs transition border-l border-slate-400 ${
              view === "map" ? "bg-[hsl(var(--primary))] text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Map className="h-3.5 w-3.5" />
            Map
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-400 bg-white px-5 py-4">
        {/* Secondary controls bar */}
        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-100">
          <span className="text-sm text-slate-500">{resultsLabel}</span>
          {view === "grid" && (
            <select
              className="h-8 rounded-md border border-slate-400 bg-white px-2 text-xs text-slate-500 shadow-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]/20"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <optgroup label="Livability">
                <option value="livability_desc">Livability: High to low</option>
                <option value="livability_asc">Livability: Low to high</option>
              </optgroup>
              <optgroup label="Safety">
                <option value="safety_desc">Safety: High to low</option>
                <option value="safety_asc">Safety: Low to high</option>
              </optgroup>
              <optgroup label="Rent">
                <option value="rent_asc">Rent: Low to high</option>
                <option value="rent_desc">Rent: High to low</option>
              </optgroup>
              <optgroup label="Population">
                <option value="population_desc">Population: High to low</option>
                <option value="population_asc">Population: Low to high</option>
              </optgroup>
              <optgroup label="Reviews">
                <option value="reviews_desc">Reviews: Most first</option>
                <option value="reviews_asc">Reviews: Least first</option>
              </optgroup>
              <optgroup label="Name">
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </optgroup>
            </select>
          )}
        </div>

        {view === "map" ? (
          loading ? (
            <Loading />
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-600">
              No cities match your search.
            </div>
          ) : (
            <CitiesMap cities={filtered} />
          )
        ) : loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-600">
            No cities match your search.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pb-2">
            {filtered.map((city) => (
              <CityCard key={city.slug} city={city} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
