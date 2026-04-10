import { Link } from "react-router-dom";
import { GitCompareArrows } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { fmtMoney, fmtNum, fmtPop, toOutOf10, clamp01 } from "@/lib/format";
import { scoreColor, scoreLabel } from "@/lib/ratings";

/** Thin horizontal progress bar. `pct` is a 0–100 number. */
function ScoreBar({ pct, barClass }) {
  const safePct = clamp01((pct ?? 0) / 100) * 100;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${barClass}`}
        style={{ width: `${safePct}%` }}
      />
    </div>
  );
}

/** "Great" / "Good" / "Fair" pill badge shown in the card hero. */
function ScoreLabelBadge({ label, pillClass }) {
  if (!label) return null;
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${pillClass}`}
    >
      {label}
    </span>
  );
}

/** Stacked label/value pair used inside `CityCard` metric rows. */
function Stat({ label, value, bar = null }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="text-xs font-semibold text-slate-900 tabular-nums">
        {value}
      </div>
      {bar}
    </div>
  );
}

/** Card displaying a city's livability score, key metrics (safety, median rent, reviews), and a link to the detail page. */
export default function CityCard({ city }) {
  const score10 = toOutOf10(city?.livabilityScore);
  const score =
    city?.livabilityScore != null
      ? Math.round(Number(city.livabilityScore))
      : null;
  const tone = scoreColor(score10);
  const label = scoreLabel(score10);

  const livabilityPct = clamp01((city?.livabilityScore ?? 0) / 100) * 100;
  const safetyPct = clamp01((city?.safetyScore ?? 0) / 10) * 100;
  const safetyTone = scoreColor(city?.safetyScore ?? null);

  const cityName = city?.name || "N/A";
  const cityState = city?.state || null;
  const nameFontSize =
    cityName.length > 14
      ? "text-lg"
      : cityName.length > 10
        ? "text-xl"
        : "text-2xl";

  return (
    <Card className="group overflow-hidden border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md p-0">
      <Link
        to={`/cities/${city?.slug || ""}`}
        state={{ from: "cities" }}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        {/* HEADER — city name + badge only */}
        <div className="bg-[hsl(var(--secondary))] px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <div className={`${nameFontSize} font-bold leading-tight text-slate-900`}>
              {cityName}
            </div>
            {cityState && (
              <div className="shrink-0 text-sm font-medium text-slate-500">
                {cityState}
              </div>
            )}
          </div>
          <ScoreLabelBadge label={label} pillClass={tone.pill} />
        </div>

        {/* BODY — all metrics in white */}
        <CardContent className="px-4 pt-4 pb-4">
          {/* Livability score — primary metric */}
          <div className="flex items-end justify-between gap-2 mb-2">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tabular-nums leading-none text-slate-900">
                  {score == null ? "N/A" : score}
                </span>
                <span className="text-xs font-medium text-slate-400 leading-none pb-0.5">/100</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Overall livability score</div>
            </div>
            {city?.reviewCount != null && city.reviewCount > 0 && (
              <span className="text-xs text-slate-400 tabular-nums shrink-0 pb-0.5">
                {city.reviewCount} {city.reviewCount === 1 ? "review" : "reviews"}
              </span>
            )}
          </div>
          <ScoreBar pct={livabilityPct} barClass={tone.bar} />

          {/* Divider */}
          <div className="my-4 border-t border-slate-100" />

          {/* Secondary metrics */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            <Stat
              label="Safety"
              value={
                city?.safetyScore != null
                  ? `${fmtNum(city.safetyScore, { digits: 1 })}/10`
                  : "N/A"
              }
              bar={
                city?.safetyScore != null ? (
                  <ScoreBar pct={safetyPct} barClass={safetyTone.bar} />
                ) : null
              }
            />
            <Stat label="Median rent" value={fmtMoney(city?.medianRent)} />
            <Stat label="Population" value={fmtPop(city?.population)} />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-900 underline-offset-4 decoration-sky-400 group-hover:underline">
              View details →
            </div>
            <Link
              to={`/compare?a=${city?.slug || ""}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
            >
              <GitCompareArrows className="h-3 w-3" />
              Compare
            </Link>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
