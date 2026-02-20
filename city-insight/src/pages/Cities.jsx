import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import CityCard from "../components/city/CityCard";
import { Input } from "../components/ui/input";
import { usePageTitle } from "../hooks/usePageTitle";
import { Loading } from "../components/ui/loading";
import PageHero from "../components/layout/PageHero";
import SectionCard from "../components/layout/SectionCard";

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("livability_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError("");

    api
      .get("/api/cities", { params: { limit: 100 } })
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

  const title = q.trim() ? "Cities" : "Cities";

  usePageTitle(title);

  // const controls = (
  //   <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[360px]">
  //     <div className="flex items-center gap-2">
  //       <span className="text-sm text-slate-600">Sort</span>
  //       <select
  //         className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200/60"
  //         value={sort}
  //         onChange={(e) => setSort(e.target.value)}
  //       >
  //         <option value="livability_desc">Highest rating</option>
  //         <option value="safety_desc">Safest</option>
  //         <option value="rent_asc">Lowest rent</option>
  //         <option value="rent_desc">Highest rent</option>
  //         <option value="reviews_desc">Most reviews</option>
  //         <option value="name_asc">Name (A–Z)</option>
  //       </select>
  //     </div>

  //     <Input
  //       value={q}
  //       onChange={(e) => setQ(e.target.value)}
  //       placeholder="Search cities…"
  //       className="h-10 w-full"
  //     />
  //   </div>
  // );

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
              : `${filtered.length} matches`
        }
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by city or state…"
              className="h-10 w-full sm:w-72 bg-white border-slate-300 focus:border-sky-400 focus:ring-sky-400"
            />
          </div>
        }
      >
        {loading ? (
          // <div className="text-sm text-slate-600">Loading…</div>
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
              <CityCard key={c.slug} city={c} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
