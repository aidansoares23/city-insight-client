import { useState } from "react";
import { Star, Shield, DollarSign, Wind, TrendingUp, Info } from "lucide-react";
import SectionCard from "@/components/layout/SectionCard";
import { scoreColor, scoreLabel } from "@/lib/ratings";
import { toOutOf10, clamp01 } from "@/lib/format";
import { cn } from "@/utils/utils";

// Representative dataset norms used for the interactive demo.
// These approximate the real min/max values in our database.
const NORMS = {
  review: { min: 3.5, max: 9.0 },         // average review score (0–10)
  safety: { min: 2.5, max: 9.5 },         // safety score (0–10)
  rent:   { min: 900,  max: 3800 },        // monthly rent in USD
  aqi:    { min: 10,  max: 180 },          // EPA Air Quality Index
};

const WEIGHTS = { review: 0.45, safety: 0.30, rent: 0.15, aqi: 0.10 };

const DEFAULTS = { review: 7.0, safety: 7.0, rent: 1800, aqi: 50 };

// Scoring math — mirrors the server-side V1 algorithm

function rangeScore(value, min, max) {
  if (max <= min) return null;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function rangeScoreInverted(value, min, max) {
  if (max <= min) return null;
  return Math.max(0, Math.min(100, ((max - value) / (max - min)) * 100));
}

function computeLivability({ review, safety, rent, aqi }) {
  const signals = [
    { score: rangeScore(review, NORMS.review.min, NORMS.review.max),         weight: WEIGHTS.review },
    { score: rangeScore(safety, NORMS.safety.min, NORMS.safety.max),         weight: WEIGHTS.safety },
    { score: rangeScoreInverted(rent, NORMS.rent.min, NORMS.rent.max),       weight: WEIGHTS.rent },
    { score: rangeScoreInverted(aqi,  NORMS.aqi.min,  NORMS.aqi.max),        weight: WEIGHTS.aqi },
  ].filter((s) => s.score != null);

  if (signals.length === 0) return null;
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  return Math.round(signals.reduce((sum, s) => sum + s.score * (s.weight / totalWeight), 0));
}

function arcStroke(score10) {
  if (score10 == null) return "hsl(var(--score-neutral))";
  if (score10 >= 7) return "hsl(var(--score-good))";
  if (score10 >= 4) return "hsl(var(--score-ok))";
  return "hsl(var(--score-bad))";
}

function ScoreRing({ score100 }) {
  const r = 72;
  const circumference = 2 * Math.PI * r;
  const score10 = toOutOf10(score100);
  const pct = score100 == null ? 0 : clamp01(score100 / 100);
  const tone = scoreColor(score10);
  const label = scoreLabel(score10);

  return (
    <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="100" cy="100" r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <circle
          cx="100" cy="100" r={r}
          fill="none"
          stroke={arcStroke(score10)}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
          style={{ transition: "stroke-dasharray 0.35s ease" }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center gap-0.5 text-center">
        {score100 != null ? (
          <>
            <span className="text-5xl font-bold leading-none tabular-nums text-slate-900">
              {Math.round(score100)}
            </span>
            <span className="text-sm font-medium text-slate-400">/100</span>
            {label && (
              <span className={cn("mt-2 rounded-full px-2.5 py-1 text-xs font-semibold", tone.pill)}>
                {label}
              </span>
            )}
          </>
        ) : (
          <span className="text-lg font-semibold text-slate-400">N/A</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FactorBar — visual output row
// ---------------------------------------------------------------------------

function FactorBar({ icon: Icon, name, weight, normalizedScore, rawLabel }) {
  const score10 = normalizedScore == null ? null : normalizedScore / 10;
  const tone = scoreColor(score10);
  const label = scoreLabel(score10);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tone.pill)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-sm font-semibold text-slate-900">{name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {label && (
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tone.pill)}>
              {label}
            </span>
          )}
          <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-semibold text-slate-500 tabular-nums">
            {weight}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-10">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
          <div
            className={cn("absolute inset-y-0 left-0 rounded-full", tone.bar)}
            style={{ width: `${normalizedScore ?? 0}%`, transition: "width 0.35s ease" }}
          />
        </div>
        <span className="w-20 text-right text-xs font-medium tabular-nums text-slate-600">
          {rawLabel}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SliderInput — labeled range slider
// ---------------------------------------------------------------------------

function SliderInput({ icon: Icon, label, description, value, min, max, step, onChange, formatValue }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[hsl(var(--muted))] px-2.5 py-0.5 text-xs font-bold tabular-nums text-slate-900">
          {formatValue(value)}
        </span>
      </div>

      <div className="pl-10">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)`,
          }}
        />
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LivabilityBreakdown — interactive score calculator
// ---------------------------------------------------------------------------

export default function LivabilityBreakdown() {
  const [review, setReview] = useState(DEFAULTS.review);
  const [safety, setSafety] = useState(DEFAULTS.safety);
  const [rent,   setRent]   = useState(DEFAULTS.rent);
  const [aqi,    setAqi]    = useState(DEFAULTS.aqi);

  const reviewScore = rangeScore(review, NORMS.review.min, NORMS.review.max);
  const safetyScore = rangeScore(safety, NORMS.safety.min, NORMS.safety.max);
  const rentScore   = rangeScoreInverted(rent, NORMS.rent.min, NORMS.rent.max);
  const aqiScore    = rangeScoreInverted(aqi,  NORMS.aqi.min,  NORMS.aqi.max);
  const livability  = computeLivability({ review, safety, rent, aqi });

  return (
    <SectionCard
      icon={TrendingUp}
      title="Try it yourself"
      subtitle="Adjust the sliders to see how each factor shapes the livability score in real time."
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Left: sliders */}
        <div className="space-y-6">
          <SliderInput
            icon={Star}
            label="Community Rating"
            description="Average resident review score"
            value={review} min={1} max={10} step={0.1}
            onChange={setReview}
            formatValue={(v) => `${v.toFixed(1)} / 10`}
          />
          <SliderInput
            icon={Shield}
            label="Safety Score"
            description="Crime-based safety index (higher = safer)"
            value={safety} min={1} max={10} step={0.1}
            onChange={setSafety}
            formatValue={(v) => `${v.toFixed(1)} / 10`}
          />
          <SliderInput
            icon={DollarSign}
            label="Monthly Rent"
            description="Median rent in this city"
            value={rent} min={500} max={5000} step={50}
            onChange={setRent}
            formatValue={(v) => `$${v.toLocaleString()}`}
          />
          <SliderInput
            icon={Wind}
            label="Air Quality (AQI)"
            description="Lower AQI = cleaner air"
            value={aqi} min={0} max={300} step={1}
            onChange={setAqi}
            formatValue={(v) => `AQI ${v}`}
          />
        </div>

        {/* Right: score ring + factor bars */}
        <div className="flex flex-col gap-6">
          <ScoreRing score100={livability} />

          <div className="space-y-4">
            <FactorBar
              icon={Star} name="Community Rating" weight={45}
              normalizedScore={reviewScore}
              rawLabel={`${review.toFixed(1)} / 10`}
            />
            <FactorBar
              icon={Shield} name="Safety" weight={30}
              normalizedScore={safetyScore}
              rawLabel={`${safety.toFixed(1)} / 10`}
            />
            <FactorBar
              icon={DollarSign} name="Affordability" weight={15}
              normalizedScore={rentScore}
              rawLabel={`$${rent.toLocaleString()} / mo`}
            />
            <FactorBar
              icon={Wind} name="Air Quality" weight={10}
              normalizedScore={aqiScore}
              rawLabel={`AQI ${aqi}`}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span>
          This calculator uses representative dataset norms. Real scores compare
          each city to the actual min and max values in our database, refreshed
          weekly. If a city is missing data for a factor, that weight is
          redistributed across the remaining signals automatically.
        </span>
      </div>
    </SectionCard>
  );
}
