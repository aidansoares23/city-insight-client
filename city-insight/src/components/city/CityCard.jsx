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

export default function CityCard({ city }) {
  const score = toOutOf10(city?.livabilityScore);
  const tone = scoreColor(score);

  const cityLine = [city?.name || "—", city?.state || null]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="group overflow-hidden border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md p-0">
      <Link
        to={`/cities/${city?.slug || ""}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
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
      </Link>
    </Card>
  );
}
