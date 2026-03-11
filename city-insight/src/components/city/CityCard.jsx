import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { fmtMoney, fmtNum, toOutOf10 } from "@/lib/format";
import { scoreColor } from "@/lib/ratings";

function Stat({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900 tabular-nums">
        {value}
      </div>
    </div>
  );
}

export default function CityCard({ city, compareMode = false, selected = false, onToggle, disableToggle = false }) {
  const score = toOutOf10(city?.livabilityScore);
  const tone = scoreColor(score);

  const cityLine = [city?.name || "—", city?.state || null]
    .filter(Boolean)
    .join(", ");

  const cardBorder = compareMode
    ? selected
      ? "border-sky-400 ring-2 ring-sky-300"
      : "border-slate-200/70"
    : "border-slate-200/70";

  if (compareMode) {
    return (
      <Card
        className={`group overflow-hidden bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md p-0 cursor-pointer ${cardBorder} ${disableToggle && !selected ? "opacity-50" : ""}`}
        onClick={!disableToggle || selected ? onToggle : undefined}
      >
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <input
              type="checkbox"
              readOnly
              checked={selected}
              className="h-4 w-4 accent-sky-500 cursor-pointer"
              tabIndex={-1}
            />
          </div>
          <CardInner city={city} cityLine={cityLine} score={score} tone={tone} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md p-0">
      <Link
        to={`/cities/${city?.slug || ""}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        <CardInner city={city} cityLine={cityLine} score={score} tone={tone} />
      </Link>
    </Card>
  );
}

function CardInner({ city, cityLine, score, tone }) {
  return (
    <>
        {/* HERO SECTION — tinted background */}
        <div className="bg-[hsl(var(--secondary))] px-3 py-3 border-b border-sky-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-slate-900">
                {cityLine}
              </div>

              <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
                <span className="font-medium">Livability</span>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${tone.pill}`}
                >
                  {score == null ? "—" : `${score}/10`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* BODY */}
        <CardContent className="px-5 py-5">
          <div className="grid grid-cols-3 gap-6">
            <Stat
              label="Safety"
              value={
                city?.safetyScore != null
                  ? `${fmtNum(city.safetyScore, { digits: 1 })}/10`
                  : "—"
              }
            />
            <Stat label="Median rent" value={fmtMoney(city?.medianRent)} />
            <Stat label="Reviews" value={`${city?.reviewCount ?? 0}`} />
          </div>

          <div className="mt-6 text-sm font-medium text-slate-700 underline-offset-4 decoration-sky-400 group-hover:underline">
            View details →
          </div>
        </CardContent>
    </>
  );
}
