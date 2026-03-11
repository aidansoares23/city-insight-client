import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import PageHero from "@/components/layout/PageHero";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import CompareColumn from "@/components/city/CompareColumn";

export default function Compare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const slugs = (searchParams.get("cities") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageTitle("Compare Cities");

  useEffect(() => {
    if (slugs.length === 0) {
      setLoading(false);
      setResults([]);
      return;
    }

    setLoading(true);
    Promise.all(
      slugs.map((slug) =>
        api
          .get(`/cities/${slug}/details`)
          .then((res) => ({ slug, data: res.data, error: null }))
          .catch(() => ({ slug, data: null, error: "Failed to load city." })),
      ),
    ).then((all) => {
      setResults(all);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("cities")]);

  if (slugs.length < 2) {
    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <BackLink onClick={() => navigate("/cities")}>Back to cities</BackLink>
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Select at least 2 cities to compare. Go back and use the Compare mode.
        </div>
        <Button variant="secondary" onClick={() => navigate("/cities")}>
          Choose cities
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <BackLink onClick={() => navigate("/cities")}>Back to cities</BackLink>

      <PageHero
        title="City Comparison"
        description={`Comparing ${slugs.length} cities side by side.`}
      />

      {/* Comparison grid */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${slugs.length}, minmax(0, 1fr))` }}
      >
        {slugs.map((slug, i) => {
          const result = results[i];
          return (
            <div
              key={slug}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm"
            >
              <CompareColumn
                data={result?.data ?? null}
                error={result?.error ?? null}
                loading={loading}
              />
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <Button variant="secondary" size="sm" onClick={() => navigate("/cities")}>
          ← Edit selection
        </Button>
      </div>
    </div>
  );
}
