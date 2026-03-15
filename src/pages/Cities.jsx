import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Map, X } from "lucide-react";
import api from "@/services/api";
import CityCard from "@/components/city/CityCard";
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/ui/loading";
import PageHero from "@/components/layout/PageHero";
import SectionCard from "@/components/layout/SectionCard";
import CitiesMap from "@/components/city/CitiesMap";

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("livability_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");

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
    const query = searchInput.trim().toLowerCase();

    let list = query
      ? cities.filter((city) =>
          `${city.name || ""} ${city.state || ""} ${city.slug || ""}`
            .toLowerCase()
            .includes(query),
        )
      : cities;

    const toNum = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);

    const desc = (a, b) => {
      const aNum = toNum(a),
        bNum = toNum(b);
      if (aNum == null && bNum == null) return 0;
      if (aNum == null) return 1;
      if (bNum == null) return -1;
      return bNum - aNum;
    };

    const asc = (a, b) => {
      const aNum = toNum(a),
        bNum = toNum(b);
      if (aNum == null && bNum == null) return 0;
      if (aNum == null) return 1;
      if (bNum == null) return -1;
      return aNum - bNum;
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
  }, [cities, searchInput, sort]);

  usePageTitle("Cities");

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
              ? "Couldn't load cities."
              : view === "grid"
                ? `${filtered.length} matches`
                : `${cities.length} cities on map`
        }
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {view === "grid" && (
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

            {view === "grid" && (
              <div className="relative w-full sm:w-72">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by city or state…"
                  className={`h-10 w-full bg-white border-slate-300 focus:border-sky-400 focus:ring-sky-400 ${searchInput ? "pr-8" : ""}`}
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
            )}

            <div className="flex w-fit items-center rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`flex items-center gap-1.5 px-3 h-10 text-sm transition ${
                  view === "grid"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-1.5 px-3 h-10 text-sm transition border-l border-slate-200 ${
                  view === "map"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Map className="h-4 w-4" />
                Map
              </button>
            </div>
          </div>
        }
      >
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
            {filtered.map((city) => (
              <CityCard key={city.slug} city={city} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
