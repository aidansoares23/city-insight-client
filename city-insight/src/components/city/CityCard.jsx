import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";

function fmtScoreOutOf10(x) {
  if (x == null) return null;
  const outOf10 = Math.round((Number(x) / 10) * 10) / 10;
  return Number.isFinite(outOf10) ? outOf10 : null;
}

function fmtMoney(x) {
  if (x == null) return "—";
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtSafety(x) {
  if (x == null) return "—";
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}

function scoreTone(outOf10) {
  if (outOf10 == null) {
    return {
      pill: "bg-slate-100 text-slate-700",
      hero: "bg-slate-50",
    };
  }

  if (outOf10 >= 7.5) {
    return {
      pill: "bg-emerald-100 text-emerald-800",
      hero: "bg-emerald-50",
    };
  }

  if (outOf10 >= 5.5) {
    return {
      pill: "bg-slate-200 text-slate-900",
      hero: "bg-slate-50",
    };
  }

  if (outOf10 >= 4) {
    return {
      pill: "bg-amber-100 text-amber-800",
      hero: "bg-amber-50",
    };
  }

  return {
    pill: "bg-rose-100 text-rose-800",
    hero: "bg-rose-50",
  };
}

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
  const score = fmtScoreOutOf10(city?.livabilityScore);
  const tone = scoreTone(score);

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
                  ? `${fmtSafety(city.safetyScore)} /100`
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
