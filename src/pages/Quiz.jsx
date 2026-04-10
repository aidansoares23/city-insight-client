import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { RatingSlider } from "@/components/ui/RatingSlider";
import CityCard from "@/components/city/CityCard";
import SectionCard from "@/components/layout/SectionCard";
import {
  Sliders,
  Trophy,
  ArrowRight,
  ArrowLeft,
  GitCompareArrows,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/utils/utils";

const CRITERIA = [
  {
    key: "safety",
    label: "Safety",
    description: "Low crime, secure neighborhoods",
  },
  {
    key: "affordability",
    label: "Affordability",
    description: "Low rent and cost of living",
  },
  {
    key: "walkability",
    label: "Walkability",
    description: "Easy to get around on foot",
  },
  {
    key: "cleanliness",
    label: "Cleanliness",
    description: "Clean streets and public spaces",
  },
  {
    key: "environment",
    label: "Environment",
    description: "Clean air and low pollution",
  },
];

const SIZE_OPTIONS = [
  { key: "any",    label: "Any size",      sub: "No preference" },
  { key: "small",  label: "Small city",    sub: "Under 200K people" },
  { key: "medium", label: "Mid-size city", sub: "200K – 750K people" },
  { key: "large",  label: "Major metro",   sub: "750K+ people" },
];

const TOTAL_STEPS = CRITERIA.length + 1; // 5 sliders + city size step

const DEFAULT_WEIGHTS = {
  safety: 5,
  affordability: 5,
  walkability: 5,
  cleanliness: 5,
  environment: 5,
};

export default function Quiz() {
  usePageTitle("City Match");

  const [step, setStep] = useState("quiz"); // "quiz" | "size" | "loading" | "results"
  const [questionIndex, setQuestionIndex] = useState(0);
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });
  const [sizePreference, setSizePreference] = useState("any");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const currentCriterion = CRITERIA[questionIndex];
  const isLastQuestion = questionIndex === CRITERIA.length - 1;
  const progressPct = ((questionIndex + 1) / TOTAL_STEPS) * 100;
  const sizeProgressPct = (TOTAL_STEPS / TOTAL_STEPS) * 100;

  function setWeight(key, val) {
    setWeights((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    setStep("loading");
    setError("");
    try {
      const res = await api.post("/cities/recommend", { weights: { ...weights, sizePreference } });
      setResults(res.data?.cities ?? []);
      setStep("results");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("quiz");
      setQuestionIndex(0);
    }
  }

  function handleNext() {
    if (isLastQuestion) {
      setStep("size");
    } else {
      setQuestionIndex((i) => i + 1);
    }
  }

  function handleBack() {
    setQuestionIndex((i) => i - 1);
  }

  function handleBackFromSize() {
    setStep("quiz");
    setQuestionIndex(CRITERIA.length - 1);
  }

  function handleReset() {
    setStep("quiz");
    setQuestionIndex(0);
    setResults([]);
    setError("");
    setWeights({ ...DEFAULT_WEIGHTS });
    setSizePreference("any");
  }

  function handleAdjust() {
    setStep("quiz");
    setQuestionIndex(0);
    setError("");
  }

  const compareLink =
    results.length >= 2
      ? `/compare?${results
          .slice(0, 3)
          .map((c, i) => `${["a", "b", "c"][i]}=${c.slug}`)
          .join("&")}`
      : null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PageHero
        title="City Match"
        description="Tell us what matters most to you — we'll match you with the cities that fit your lifestyle."
      />

      {/* Quiz: one question at a time */}
      {step === "quiz" && (
        <div className="max-w-2xl mx-auto w-full">
        <SectionCard icon={Sliders} title="What matters most to you?">
          <div>
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500">
                <span>
                  Question {questionIndex + 1} of {TOTAL_STEPS}
                </span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <ErrorMessage message={error} className="mb-4" />

            {/* Current question */}
            <div className="py-4">
              <p className="text-xl font-semibold text-slate-900 mb-1">
                {currentCriterion.label}
              </p>
              <p className="text-sm text-slate-500 mb-6">
                {currentCriterion.description}
              </p>
              <RatingSlider
                key={currentCriterion.key}
                label={currentCriterion.label}
                description=""
                value={weights[currentCriterion.key]}
                onChange={(val) => setWeight(currentCriterion.key, val)}
                min={0}
                max={10}
                minLabel="Not important"
                maxLabel="Very important"
              />
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <div>
                {questionIndex > 0 && (
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>
              <Button onClick={handleNext}>
                {isLastQuestion ? (
                  <>
                    Find my city <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </SectionCard>
        </div>
      )}

      {/* City size step */}
      {step === "size" && (
        <div className="max-w-2xl mx-auto w-full">
        <SectionCard icon={Sliders} title="What size city do you prefer?">
          <div>
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500">
                <span>Question {TOTAL_STEPS} of {TOTAL_STEPS}</span>
                <span>{Math.round(sizeProgressPct)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
                  style={{ width: `${sizeProgressPct}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              We'll prioritize cities that match your preference for urban scale.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSizePreference(opt.key)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-left transition-colors",
                    sizePreference === opt.key
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <p className={cn("text-sm font-semibold", sizePreference === opt.key ? "text-[hsl(var(--primary))]" : "text-slate-900")}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={handleBackFromSize}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Find my city <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </SectionCard>
        </div>
      )}

      {/* Loading */}
      {step === "loading" && (
        <div className="max-w-2xl mx-auto w-full">
        <SectionCard icon={Sliders} title="Finding your best matches…">
          <div className="space-y-3 py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full animate-pulse bg-slate-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        </div>
      )}

      {/* Results */}
      {step === "results" && results.length > 0 && (
        <SectionCard
          icon={Trophy}
          title="Your top matches"
          subtitle="Based on your preferences"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((city) => (
              <div key={city.slug} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-0.5">
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      city.rank === 1
                        ? "bg-amber-400 text-white"
                        : city.rank === 2
                          ? "bg-slate-400 text-white"
                          : city.rank === 3
                            ? "bg-orange-400 text-white"
                            : "bg-slate-300 text-slate-600",
                    )}
                  >
                    {city.rank}
                  </span>
                  <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
                      style={{ width: `${city.matchPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {city.matchPct}% match
                  </span>
                </div>
                <CityCard
                  city={{
                    slug: city.slug,
                    name: city.name,
                    state: city.state,
                    livabilityScore: city.scores?.livability,
                    safetyScore: city.scores?.safety,
                    medianRent: city.medianRent,
                    population: city.population,
                    reviewCount: city.reviewCount,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAdjust}>
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                Adjust preferences
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-slate-500"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Start over
              </Button>
            </div>
            {compareLink && (
              <Button variant="secondary" size="sm" asChild>
                <Link to={compareLink}>
                  <GitCompareArrows className="h-3.5 w-3.5 mr-1.5" />
                  Compare top 3
                </Link>
              </Button>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
