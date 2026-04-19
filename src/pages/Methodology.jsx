// src/pages/Methodology.jsx
import { Link } from "react-router-dom";
import PageHero from "@/components/layout/PageHero";
import LivabilityBreakdown from "@/components/city/LivabilityBreakdown";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

import {
  BarChart3,
  Database,
  MessageCircle,
  Shield,
  Home,
  Users,
  RefreshCcw,
  Info,
  Calculator,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Wind,
} from "lucide-react";

// ─── Sub-components ────────────────────────────────────────────────────────

/** Small bordered card with an icon, title, and description — used in overview grids. */
function MiniCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-lg border border-slate-400 bg-white px-4 py-4">
      <div className="flex items-center gap-2.5">
        {Icon ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Icon className="h-4 w-4 text-slate-500" />
          </div>
        ) : null}
        <div className="text-sm font-semibold text-slate-900">{title}</div>
      </div>
      <div className="mt-2.5 text-sm leading-relaxed text-slate-500">
        {children}
      </div>
    </div>
  );
}

/** Card with an icon, title, optional badge, and description — used in data-source sections. */
function StatCard({ icon: Icon, title, badge, children }) {
  return (
    <div className="rounded-lg border border-slate-400 bg-white px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        {Icon ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Icon className="h-4 w-4 text-slate-500" />
          </div>
        ) : null}
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
        {children}
      </p>
    </div>
  );
}

/** Inline code style for numbers / field names inside prose. */
function Mono({ children }) {
  return (
    <span className="rounded bg-[hsl(var(--muted))] px-1 py-0.5 font-mono text-xs text-slate-700">
      {children}
    </span>
  );
}

/** Indented formula block — shows the actual math. */
function FormulaBlock({ children }) {
  return (
    <div className="mt-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-3 font-mono text-xs leading-relaxed text-slate-700">
      {children}
    </div>
  );
}

/** One row in the formula section — label left, detail right. */
function FormulaRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[hsl(var(--border))] bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="shrink-0 text-sm font-semibold text-slate-900 sm:w-[30%] flex items-center gap-2">
        {label}
      </div>
      <div className="text-sm leading-relaxed text-slate-500 sm:w-[66%]">
        {children}
      </div>
    </div>
  );
}

/** Weight bar used inside the livability blend table. */
function WeightBar({ pct, color = "bg-blue-400" }) {
  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-[hsl(var(--muted))]">
      <div
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
// ─── Page ──────────────────────────────────────────────────────────────────

/** Comprehensive methodology page explaining data sources, scoring formulas, and the livability blend. */
export default function Methodology() {
  usePageTitle("How It Works");

  return (
    <div className="space-y-4">
      <PageHero
        title="How it works"
        description="City Insight blends community reviews with public data to give you a fast, honest read on any California city. Here's exactly what we measure, where it comes from, and how the numbers are calculated."
        nav={[
          { href: "#glance", label: "At a glance" },
          { href: "#scores", label: "Score formulas" },
          { href: "#calculator", label: "Score calculator" },
          { href: "#metrics", label: "Metrics glossary" },
          { href: "#sources", label: "Sources" },
        ]}
      />

      {/* ── At a glance ────────────────────────────────────────────────── */}
      <div
        id="glance"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            At a glance
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          The quick version — what we use, how often it updates, and how we
          handle missing data.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <MiniCard icon={Database} title="Data sources">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold text-slate-900">
                  Population &amp; rent —
                </span>{" "}
                U.S. Census Bureau (ACS 5-year estimates, 2023)
              </li>
              <li>
                <span className="font-semibold text-slate-900">
                  Crime data —
                </span>{" "}
                FBI Crime Data Explorer API (agency-level per-100k rates,
                2020–2023)
              </li>
              <li>
                <span className="font-semibold text-slate-900">
                  Air quality —
                </span>{" "}
                OpenAQ API (PM2.5 → AQI, nearest monitoring stations)
              </li>
              <li>
                <span className="font-semibold text-slate-900">Reviews —</span>{" "}
                signed-in users; integer ratings 1–10 across four categories
                (safety, affordability, walkability, cleanliness); an overall
                score is derived automatically
              </li>
              <li>
                <span className="font-semibold text-slate-900">
                  City summaries —
                </span>{" "}
                AI-generated 3–4 sentence snapshots (Claude Haiku); cached and
                regenerated after 50+ new reviews
              </li>
            </ul>
          </MiniCard>

          <MiniCard icon={RefreshCcw} title="Update cadence">
            Public datasets (Census, crime) and the dataset-wide scoring norms
            are refreshed{" "}
            <span className="font-semibold text-slate-900">once per week</span>.
            Review averages and Livability scores update{" "}
            <span className="font-semibold text-slate-900">instantly</span> the
            moment a review is submitted, edited, or removed.
          </MiniCard>

          <MiniCard icon={Calculator} title="What we compute">
            For each city we track a running total of all review ratings and
            derive live averages. Those averages, combined with an objective
            safety score, rent affordability, and air quality index, feed into a
            single{" "}
            <span className="font-semibold text-slate-900">
              Livability score (0–100)
            </span>
            .
          </MiniCard>

          <MiniCard icon={CheckCircle2} title="Missing data">
            Any unknown value is shown as{" "}
            <span className="font-semibold text-slate-900">N/A</span> rather
            than guessed. The Livability score simply drops the missing signal
            and renormalizes the remaining weights so the result still reflects
            everything that is known.
          </MiniCard>
        </div>
      </div>

      {/* ── Scores ─────────────────────────────────────────────────────── */}
      <div
        id="scores"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            How scores are calculated
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Exact formulas — no black boxes.
        </p>
        <div className="mt-3 space-y-3">
          {/* Review ratings */}
          <FormulaRow label="Review ratings (1–10)">
            Reviewers rate four categories:{" "}
            <span className="font-semibold text-slate-900">
              safety, affordability, walkability,
            </span>{" "}
            and{" "}
            <span className="font-semibold text-slate-900">cleanliness</span>.
            Each is an integer from 1–10. An{" "}
            <span className="font-semibold text-slate-900">overall</span> score
            is then automatically derived as the simple average of the four,
            rounded to the nearest integer. City averages update in real time on
            every review change.
          </FormulaRow>

          {/* Safety score */}
          <FormulaRow label="Safety score (0–10)">
            <p>
              Derived from the{" "}
              <span className="font-semibold text-slate-900">
                FBI Crime Data Explorer API
              </span>{" "}
              (violent and property crime). The FBI returns rates already
              normalized per 100k residents — no local population lookup needed.
              Steps:
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                For each crime type, average the monthly per-100k rates across
                the most recent{" "}
                <span className="font-semibold text-slate-900">3 years</span> of
                available data (2020–2023), then annualize (monthly avg × 12).
              </li>
              <li>
                Combine into a{" "}
                <span className="font-semibold text-slate-900">
                  weighted average
                </span>{" "}
                — violent crimes count 3×, property 1× — to produce a single
                annual crime index per 100k.
              </li>
              <li>
                Map linearly to 0–10 where an index of{" "}
                <span className="font-semibold text-slate-900">0</span> → score{" "}
                <span className="font-semibold text-slate-900">10.0</span>{" "}
                (safest) and an index of{" "}
                <span className="font-semibold text-slate-900">2,500</span> →
                score <span className="font-semibold text-slate-900">0.0</span>.
              </li>
            </ol>
            <FormulaBlock>
              <div>{"// FBI API returns monthly per-100k rates:"}</div>
              <div>annualViolent = avgMonthlyRate(violent) × 12</div>
              <div>annualProperty = avgMonthlyRate(property) × 12</div>
              <div className="mt-1">
                crimeIndex = (annualViolent × 3 + annualProperty × 1) / 4
              </div>
              <div>safetyScore = clamp(10 − crimeIndex / 2500 × 10, 0, 10)</div>
              <div className="mt-1 text-slate-400">
                ↳ US avg violent ≈380, property ≈2000 per 100k → index ≈785 →
                score ≈6.9
              </div>
            </FormulaBlock>
            <p className="mt-2 text-xs text-slate-500">
              Result is stored with one decimal place (e.g. 7.2). The 2,500
              threshold is calibrated so a city with a very high weighted crime
              index approaches 0 rather than saturating prematurely.
            </p>
          </FormulaRow>

          {/* Livability score */}
          <FormulaRow label="Livability score (0–100)">
            <p>
              A weighted blend of up to four signals scored
              <span className="font-semibold text-slate-900">
                {" "}
                relative to all cities in the dataset
              </span>
              . Each signal is ranked within its observed range — the best city
              on that metric scores 100, the worst scores 0, and everyone else
              falls in between. Any missing signal is excluded and the remaining
              weights are renormalized to sum to 1.
            </p>

            <div className="mt-3 space-y-2">
              {/* Signal 1 */}
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>Community overall rating</span>
                  <Badge variant="secondary">45 %</Badge>
                </div>
                <WeightBar pct={45} color="bg-blue-400" />
                <p className="mt-1 text-xs text-slate-500">
                  Reviewer <Mono>overall</Mono> average ranked against all
                  cities that have reviews. The highest-rated city → 100 pts;
                  the lowest → 0 pts.
                </p>
              </div>

              {/* Signal 2 */}
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>Objective safety score</span>
                  <Badge variant="secondary">30 %</Badge>
                </div>
                <WeightBar pct={30} color="bg-emerald-400" />
                <p className="mt-1 text-xs text-slate-500">
                  Crime-derived <Mono>safetyScore</Mono> (0–10) ranked against
                  all cities with safety data. Safest city → 100 pts; least safe
                  → 0 pts.
                </p>
              </div>

              {/* Signal 3 */}
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>Rent affordability</span>
                  <Badge variant="secondary">15 %</Badge>
                </div>
                <WeightBar pct={15} color="bg-amber-400" />
                <p className="mt-1 text-xs text-slate-500">
                  <Mono>medianRent</Mono> ranked inversely — the cheapest city
                  in the dataset → 100 pts; the most expensive → 0 pts.
                </p>
              </div>

              {/* Signal 4 */}
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>Air quality (AQI)</span>
                  <Badge variant="secondary">10 %</Badge>
                </div>
                <WeightBar pct={10} color="bg-sky-400" />
                <p className="mt-1 text-xs text-slate-500">
                  <Mono>aqiValue</Mono> ranked inversely — lower AQI means
                  cleaner air, which earns more points. The city with the best
                  air in the dataset → 100 pts; worst → 0 pts.
                </p>
              </div>
            </div>
          </FormulaRow>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div className="font-medium text-amber-900">Keep in mind</div>
          </div>
          <p className="mt-2 text-sm text-amber-800/80">
            All scores are point-in-time estimates. Crime data lags by at least
            a year; Census data by up to five. Community reviews reflect whoever
            chose to write one. Use City Insight as a starting point — not a
            final verdict.
          </p>
        </div>
      </div>

      {/* ── Interactive score calculator ───────────────────────────────── */}
      <div id="calculator" className="scroll-mt-28">
        <LivabilityBreakdown />
      </div>

      {/* ── Metrics glossary ───────────────────────────────────────────── */}
      <div
        id="metrics"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            What the metrics mean
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Plain-English definitions for every number on city pages.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <StatCard icon={Users} title="Population" badge="residents">
            ACS 5-year estimate. Useful for context when comparing review counts
            or crime rates between cities of very different sizes.
          </StatCard>

          <StatCard icon={Home} title="Median rent" badge="$/month">
            ACS 5-year median gross rent. Also the direct input to the
            affordability signal in the Livability score — each city is ranked
            against the full dataset, so lower rent always earns more points
            relative to other cities.
          </StatCard>

          <StatCard icon={Calculator} title="Affordability score" badge="0–10">
            Census median rent ranked inversely against all cities in the
            dataset and converted to a 0–10 scale. The cheapest city → 10, the
            most expensive → 0. This is the objective counterpart to the
            community's affordability rating, shown side-by-side on city pages
            so you can compare what residents feel against what the rent data
            says.
          </StatCard>

          <StatCard icon={Shield} title="Safety score" badge="0–10">
            Crime-index-based indicator derived from a 3-year weighted average
            of violent (×3) and property (×1) annual crime rates per 100k
            residents, sourced from the FBI Crime Data Explorer API. Stored to
            one decimal place. Higher means safer. Refreshed weekly.
          </StatCard>

          <StatCard icon={Wind} title="Air quality (AQI)" badge="0–500+">
            PM2.5 concentration from the nearest OpenAQ monitoring station,
            converted to a standard AQI value. Lower is better — 0–50 is Good,
            51–100 is Moderate, 100+ starts to affect sensitive groups. Used
            inversely in the Livability score: cleaner air earns more points.
            Refreshed weekly.
          </StatCard>

          <StatCard
            icon={MessageCircle}
            title="Review ratings"
            badge="1–10 integer"
          >
            Four integer ratings per review: safety, affordability, walkability,
            and cleanliness. An overall score is automatically derived as their
            average (rounded to the nearest integer). Each city's per-category
            average updates in real time on every review change. Optional
            written notes up to 800 characters.
          </StatCard>
        </div>
      </div>

      {/* ── Sources ────────────────────────────────────────────────────── */}
      <div
        id="sources"
        className="scroll-mt-28 rounded-lg border border-slate-400 bg-white px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Where the data comes from
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Every source, every cadence.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <MiniCard icon={Users} title="U.S. Census Bureau — ACS">
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-slate-900">
                  Population:
                </span>{" "}
                ACS 5-year estimate (B01003)
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Median rent:
                </span>{" "}
                ACS 5-year median gross rent (B25064)
              </div>
              <div className="pt-1 text-slate-500">
                Current dataset: ACS 2023. Refreshed weekly via Census API.
              </div>
            </div>
          </MiniCard>

          <MiniCard icon={Shield} title="FBI Crime Data Explorer API">
            Agency-level violent and property crime rates (already normalized
            per 100k residents), transformed into a{" "}
            <span className="font-semibold text-slate-900">
              Safety score (0–10, 1 decimal)
            </span>{" "}
            using a weighted-average annual crime index, averaged over up to 3
            years (2020–2023). Scores refresh weekly.
          </MiniCard>

          <MiniCard icon={Wind} title="OpenAQ API">
            PM2.5 readings from the nearest air-quality monitoring stations,
            converted to a standard AQI value and stored as{" "}
            <span className="font-semibold text-slate-900">aqiValue</span>. Used
            as the air quality signal in the Livability score — lower AQI earns
            more points. Refreshed weekly.
          </MiniCard>

          <MiniCard icon={MessageCircle} title="Community reviews">
            Written by signed-in users. Each user gets exactly one review per
            city — submitting again replaces the previous one, so there's no
            risk of duplicate votes inflating scores. City averages update
            instantly on every submission.
          </MiniCard>

          <MiniCard icon={MessageCircle} title="AI city summaries">
            3–4 sentence city snapshots generated by{" "}
            <span className="font-semibold text-slate-900">Claude Haiku</span>{" "}
            using live Firestore data. Summaries are cached and automatically
            regenerated after 50 or more new reviews accumulate. They appear on
            city detail pages and are not used in any score calculation.
          </MiniCard>

          <MiniCard icon={Database} title="OpenStreetMap Overpass API">
            Things-to-do data — attractions, restaurants, outdoors, and
            nightlife — sourced from the free public Overpass API and synced
            weekly. Displayed on city pages as a convenience; not factored into
            any score.
          </MiniCard>

          <MiniCard icon={RefreshCcw} title="Refresh schedule">
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-slate-900">Weekly:</span>{" "}
                Census metrics → FBI safety scores → OpenAQ air quality →
                scoring norms → livability recompute
              </div>
              <div>
                <span className="font-semibold text-slate-900">Instant:</span>{" "}
                review averages and Livability on every review event
              </div>
            </div>
          </MiniCard>

          <MiniCard icon={Lock} title="Sign-in &amp; privacy">
            Signing in lets you write and manage reviews. We request only basic
            profile info — name, email, and profile photo — to label your
            reviews publicly. We never see your Google password or access
            anything beyond that scope.
          </MiniCard>
        </div>
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 rounded-lg px-6 py-8 text-center">
        <p className="text-base text-slate-500">
          Now you know how it works — go see for yourself.
        </p>
        <Button asChild variant="primary" size="lg">
          <Link to="/cities">Browse California Cities</Link>
        </Button>
      </div>
    </div>
  );
}
