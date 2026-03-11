import { Link } from "react-router-dom";
import { fmtMoney, fmtNum, toOutOf10, safeNumOrNull, clamp01 } from "@/lib/format";
import { scoreColor } from "@/lib/ratings";

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-slate-100 last:border-0">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900 tabular-nums">{children}</div>
    </div>
  );
}

function RatingBar({ value }) {
  const n = safeNumOrNull(value);
  const pct = n == null ? 0 : clamp01(n / 10) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
        <div
          className="h-full bg-[hsl(var(--primary))] transition-[width] duration-300"
          style={{ width: `${pct}%`, opacity: n == null ? 0.25 : 1 }}
        />
      </div>
      <span className="w-12 text-right text-xs font-semibold text-slate-800 tabular-nums">
        {n == null ? "—" : `${n.toFixed(1)}/10`}
      </span>
    </div>
  );
}

export default function CompareColumn({ data, error, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 rounded-md bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error || "Failed to load city."}
      </div>
    );
  }

  const { city, stats, metrics, livability } = data;
  const avgRatings = stats?.averages ?? stats ?? {};
  const score = toOutOf10(
    (livability && typeof livability === "object" ? livability.score : null) ??
      stats?.livabilityScore ??
      null,
  );
  const tone = scoreColor(score);

  return (
    <div className="flex flex-col">
      {/* City name header */}
      <Link
        to={`/cities/${city?.slug || ""}`}
        className="mb-4 text-center text-base font-semibold text-slate-900 hover:underline decoration-sky-400 underline-offset-2"
      >
        {[city?.name, city?.state].filter(Boolean).join(", ")}
      </Link>

      {/* Livability score pill */}
      <div className="mb-5 flex justify-center">
        <span className={`rounded-full px-5 py-2 text-xl font-bold ${tone.pill}`}>
          {score == null ? "—" : `${score.toFixed(1)}/10`}
        </span>
      </div>

      {/* Metrics */}
      <Row label="Safety Score">
        {metrics?.safetyScore != null
          ? `${fmtNum(metrics.safetyScore, { digits: 1 })}/10`
          : "—"}
      </Row>
      <Row label="Median Rent">
        {metrics?.medianRent != null ? fmtMoney(metrics.medianRent) : "—"}
      </Row>
      <Row label="Population">
        {metrics?.population != null
          ? Number(metrics.population).toLocaleString()
          : "—"}
      </Row>
      <Row label="Reviews">{stats?.count ?? "—"}</Row>

      {/* Avg user ratings */}
      <div className="mt-3 mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        Avg User Ratings
      </div>
      {[
        { label: "Overall", key: "overall" },
        { label: "Safety", key: "safety" },
        { label: "Affordability", key: "affordability" },
        { label: "Walkability", key: "walkability" },
        { label: "Cleanliness", key: "cleanliness" },
      ].map(({ label, key }) => (
        <div key={key} className="py-2 border-b border-slate-100 last:border-0">
          <div className="mb-1 text-xs text-slate-600">{label}</div>
          <RatingBar value={avgRatings?.[key]} />
        </div>
      ))}
    </div>
  );
}
