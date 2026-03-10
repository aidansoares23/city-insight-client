// src/pages/Methodology.jsx
import { Link } from "react-router-dom";
import PageHero from "@/components/layout/PageHero";
import SectionCard from "@/components/layout/SectionCard";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
  ArrowDown,
  Star,
} from "lucide-react";

// ─── Sub-components ────────────────────────────────────────────────────────

function MiniCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-slate-600" /> : null}
        <div className="text-sm font-semibold text-slate-900">{title}</div>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, badge, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-slate-600" /> : null}
        <div className="font-medium text-slate-900">{title}</div>
        {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}

/** Inline code style for numbers / field names inside prose. */
function Mono({ children }) {
  return (
    <span className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.78rem] text-slate-700">
      {children}
    </span>
  );
}

/** Indented formula block — shows the actual math. */
function FormulaBlock({ children }) {
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-slate-700">
      {children}
    </div>
  );
}

/** One row in the formula section — label left, detail right. */
function FormulaRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="shrink-0 text-sm font-semibold text-slate-900 sm:w-[30%]">
        {label}
      </div>
      <div className="text-sm leading-relaxed text-slate-600 sm:w-[66%]">
        {children}
      </div>
    </div>
  );
}

/** One step in the pipeline flow. */
function PipelineStep({ icon: Icon, label, sub, step }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
        {step != null && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-white">
            {step}
          </span>
        )}
      </div>
      <div className="text-xs font-semibold leading-tight text-slate-800">
        {label}
      </div>
      {sub ? (
        <div className="text-[11px] leading-tight text-slate-500">{sub}</div>
      ) : null}
    </div>
  );
}

function PipelineArrow() {
  return (
    <>
      <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
      <div className="flex justify-center sm:hidden">
        <ArrowDown className="h-4 w-4 text-slate-300" />
      </div>
    </>
  );
}

/** Weight bar used inside the livability blend table. */
function WeightBar({ pct, color = "bg-blue-400" }) {
  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
      <div
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** In-page anchor link. */
function JumpLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-xs text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline transition-colors"
    >
      {children}
    </a>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function Methodology() {
  usePageTitle("How It Works");

  return (
    <div className="space-y-6">
      <PageHero
        title="How it works"
        description="City Insight blends community reviews with public data to give you a fast, honest read on any California city. Here's exactly what we measure, where it comes from, and how the numbers are calculated."
      />

      {/* ── Jump nav ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs font-medium text-slate-400">On this page:</span>
        <JumpLink href="#glance">At a glance</JumpLink>
        <span className="text-slate-300 text-xs">·</span>
        <JumpLink href="#pipeline">Data pipeline</JumpLink>
        <span className="text-slate-300 text-xs">·</span>
        <JumpLink href="#scores">Score formulas</JumpLink>
        <span className="text-slate-300 text-xs">·</span>
        <JumpLink href="#metrics">Metrics glossary</JumpLink>
        <span className="text-slate-300 text-xs">·</span>
        <JumpLink href="#sources">Sources</JumpLink>
      </div>

      {/* ── At a glance ────────────────────────────────────────────────── */}
      <div id="glance" className="scroll-mt-24" />
      <SectionCard
        title="At a glance"
        icon={Info}
        subtitle="The quick version — what we use, how often it updates, and how we handle missing data."
      >
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <MiniCard icon={Database} title="Data sources">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium text-slate-700">
                  Population &amp; rent —
                </span>{" "}
                U.S. Census Bureau (ACS 5-year estimates, 2023)
              </li>
              <li>
                <span className="font-medium text-slate-700">Crime data —</span>{" "}
                California OpenJustice reported crime statistics
              </li>
              <li>
                <span className="font-medium text-slate-700">Reviews —</span>{" "}
                signed-in users; integer ratings 1–10 across five categories
              </li>
            </ul>
          </MiniCard>

          <MiniCard icon={RefreshCcw} title="Update cadence">
            Public datasets (Census, crime) are refreshed{" "}
            <span className="font-medium text-slate-700">once per week</span>.
            Review averages and Livability scores update{" "}
            <span className="font-medium text-slate-700">instantly</span>{" "}
            the moment a review is submitted, edited, or removed.
          </MiniCard>

          <MiniCard icon={Calculator} title="What we compute">
            For each city we track a running total of all review ratings and
            derive live averages. Those averages, combined with an objective
            safety score and rent affordability, feed into a single{" "}
            <span className="font-medium text-slate-700">
              Livability score (0–100)
            </span>
            .
          </MiniCard>

          <MiniCard icon={CheckCircle2} title="Missing data">
            Any unknown value is shown as{" "}
            <span className="font-medium text-slate-700">—</span> rather than
            guessed. The Livability score simply drops the missing signal and
            renormalizes the remaining weights so the result still reflects
            everything that is known.
          </MiniCard>
        </div>
      </SectionCard>

      {/* ── Data pipeline ──────────────────────────────────────────────── */}
      <div id="pipeline" className="scroll-mt-24" />
      <SectionCard
        title="Data pipeline"
        icon={RefreshCcw}
        subtitle="How raw inputs become the numbers you see on city pages."
      >
        <div className="mt-4 space-y-5">
          {/* Pipeline A: weekly */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Weekly — objective metrics
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                <PipelineStep
                  step={1}
                  icon={Users}
                  label="Census & Crime"
                  sub="Population, rent, crime counts"
                />
                <PipelineArrow />
                <PipelineStep
                  step={2}
                  icon={Calculator}
                  label="Normalize"
                  sub="Rates per 100k residents"
                />
                <PipelineArrow />
                <PipelineStep
                  step={3}
                  icon={Shield}
                  label="Safety score"
                  sub="0–10, weighted formula"
                />
                <PipelineArrow />
                <PipelineStep
                  step={4}
                  icon={BarChart3}
                  label="Livability"
                  sub="0–100 blended score"
                />
              </div>
            </div>
          </div>

          {/* Pipeline B: reviews */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Real-time — community reviews
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                <PipelineStep
                  step={1}
                  icon={Star}
                  label="Review submitted"
                  sub="Create, edit, or delete"
                />
                <PipelineArrow />
                <PipelineStep
                  step={2}
                  icon={Database}
                  label="Scores updated"
                  sub="Instant, atomic write"
                />
                <PipelineArrow />
                <PipelineStep
                  step={3}
                  icon={Calculator}
                  label="Averages"
                  sub="Running totals → avg"
                />
                <PipelineArrow />
                <PipelineStep
                  step={4}
                  icon={BarChart3}
                  label="Livability"
                  sub="Instantly recomputed"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Scores ─────────────────────────────────────────────────────── */}
      <div id="scores" className="scroll-mt-24" />

      <SectionCard
        title="How scores are calculated"
        icon={Calculator}
        subtitle="Exact formulas — no black boxes."
      >
        <div className="space-y-3">
          {/* Review ratings */}
          <FormulaRow label="Review ratings (1–10)">
            Reviewers rate four categories:{" "}
            <span className="font-medium text-slate-700">
              safety, affordability, walkability,
            </span>{" "}
            and{" "}
            <span className="font-medium text-slate-700">cleanliness</span>.
            Each is an integer from 1–10. An{" "}
            <span className="font-medium text-slate-700">overall</span> score is
            then automatically derived as the simple average of the four,
            rounded to the nearest integer. City averages update in real time on
            every review change.
          </FormulaRow>

          {/* Safety score */}
          <FormulaRow label="Safety score (0–10)">
            <p>
              Derived from California OpenJustice crime counts (violent and
              property). Steps:
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Average each crime type over the last{" "}
                <span className="font-medium text-slate-700">3 years</span> of
                available data.
              </li>
              <li>
                Combine into a{" "}
                <span className="font-medium text-slate-700">
                  weighted average
                </span>{" "}
                — violent crimes count 3×, property 1× — then divide by total
                weight to keep the result a per-crime-type rate.
              </li>
              <li>
                Convert to a{" "}
                <span className="font-medium text-slate-700">
                  crime index per 100k residents
                </span>
                .
              </li>
              <li>
                Map linearly to 0–10 where an index of{" "}
                <span className="font-medium text-slate-700">0</span> → score{" "}
                <span className="font-medium text-slate-700">10.0</span>{" "}
                (safest) and an index of{" "}
                <span className="font-medium text-slate-700">2,500</span> →
                score <span className="font-medium text-slate-700">0.0</span>.
              </li>
            </ol>
            <FormulaBlock>
              <div>weightedAvg = (violent × 3 + property × 1) / 4</div>
              <div>crimeIndex = (weightedAvg / population) × 100,000</div>
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
              A weighted blend of up to three signals. Any missing signal is
              excluded and the remaining weights are renormalized to sum to 1.
            </p>

            <div className="mt-3 space-y-2">
              {/* Signal 1 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Community overall rating</span>
                  <Badge variant="secondary">50 %</Badge>
                </div>
                <WeightBar pct={50} color="bg-blue-400" />
                <p className="mt-1 text-xs text-slate-500">
                  Reviewer <Mono>overall</Mono> average (1–10) scaled linearly
                  to 0–100. A 5/10 average → 50 pts.
                </p>
              </div>

              {/* Signal 2 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Objective safety score</span>
                  <Badge variant="secondary">35 %</Badge>
                </div>
                <WeightBar pct={35} color="bg-emerald-400" />
                <p className="mt-1 text-xs text-slate-500">
                  Crime-derived <Mono>safetyScore</Mono> (0–10) scaled to 0–100.
                  A score of 7.0 → 70 pts.
                </p>
              </div>

              {/* Signal 3 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Rent affordability</span>
                  <Badge variant="secondary">15 %</Badge>
                </div>
                <WeightBar pct={15} color="bg-amber-400" />
                <p className="mt-1 text-xs text-slate-500">
                  Lower <Mono>medianRent</Mono> → higher score. Ceiling is
                  $3,500/mo (above that → 0 pts; free → 100 pts).
                </p>
              </div>
            </div>

            <FormulaBlock>
              <div>reviewScore = (overallAvg / 10) × 100</div>
              <div>safetyPts = safetyScore × 10</div>
              <div>
                rentScore = clamp((1 − medianRent / 3500) × 100, 0, 100)
              </div>
              <div className="mt-1">
                livability = round(Σ(score × weight) / Σ(weight))
              </div>
              <div className="mt-1 text-slate-400">
                ↳ weights drop to zero for absent signals; remainder
                renormalizes
              </div>
            </FormulaBlock>

            {/* Worked example */}
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="mb-1.5 text-xs font-semibold text-blue-800">
                Worked example
              </div>
              <div className="space-y-0.5 font-mono text-xs text-blue-700">
                <div>overallAvg = 7.2 → reviewScore = 72</div>
                <div>safetyScore = 6.8 → safetyPts = 68</div>
                <div>medianRent = $2,100 → rentScore = 40</div>
                <div className="mt-1 border-t border-blue-200 pt-1">
                  livability = round(72×0.50 + 68×0.35 + 40×0.15) ={" "}
                  <span className="font-bold">68</span>
                </div>
              </div>
            </div>
          </FormulaRow>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
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
      </SectionCard>

      {/* ── Metrics glossary ───────────────────────────────────────────── */}
      <div id="metrics" className="scroll-mt-24" />

      <SectionCard
        title="What the metrics mean"
        icon={BarChart3}
        subtitle="Plain-English definitions for every number on city pages."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <StatCard icon={Users} title="Population" badge="residents">
            ACS 5-year estimate. Useful for context when comparing review counts
            or crime rates between cities of very different sizes.
          </StatCard>

          <StatCard icon={Home} title="Median rent" badge="$/month">
            ACS 5-year median gross rent. Also the direct input to the
            affordability signal in the Livability score — cities below
            $3,500/mo earn proportional points; above that the rent signal
            contributes 0.
          </StatCard>

          <StatCard icon={Shield} title="Safety score" badge="0–10">
            Crime-index-based indicator derived from a 3-year weighted average
            of violent (×3) and property (×1) crime rates per 100k residents.
            Stored to one decimal place. Higher means safer. Refreshed weekly
            from OpenJustice data.
          </StatCard>

          <StatCard
            icon={MessageCircle}
            title="Review ratings"
            badge="1–10 integer"
          >
            Four integer ratings per review: safety, affordability, walkability, and
            cleanliness. An overall score is automatically derived as their
            average (rounded to the nearest integer). Each city's per-category
            average updates in real time on every review change. Optional
            written notes up to 800 characters.
          </StatCard>
        </div>
      </SectionCard>

      {/* ── Sources ────────────────────────────────────────────────────── */}
      <div id="sources" className="scroll-mt-24" />

      <SectionCard
        title="Where the data comes from"
        icon={Database}
        subtitle="Every source, every cadence."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <MiniCard icon={Users} title="U.S. Census Bureau — ACS">
            <div className="space-y-1">
              <div>
                <span className="font-medium text-slate-700">Population:</span>{" "}
                ACS 5-year estimate (B01003)
              </div>
              <div>
                <span className="font-medium text-slate-700">Median rent:</span>{" "}
                ACS 5-year median gross rent (B25064)
              </div>
              <div className="pt-1 text-slate-500">
                Current dataset: ACS 2023. Refreshed weekly via Census API.
              </div>
            </div>
          </MiniCard>

          <MiniCard icon={Shield} title="California OpenJustice">
            Reported violent and property crime counts by city, transformed into
            a{" "}
            <span className="font-medium text-slate-700">
              Safety score (0–10, 1 decimal)
            </span>{" "}
            using a weighted-average crime index per 100k residents, averaged
            over up to 3 years. Scores refresh weekly.
          </MiniCard>

          <MiniCard icon={MessageCircle} title="Community reviews">
            Written by signed-in users. Each user gets exactly one review per
            city — submitting again replaces the previous one, so there's no
            risk of duplicate votes inflating scores. City averages update
            instantly on every submission.
          </MiniCard>

          <MiniCard icon={RefreshCcw} title="Refresh schedule">
            <div className="space-y-1">
              <div>
                <span className="font-medium text-slate-700">Weekly:</span>{" "}
                Census metrics → crime safety scores → livability recompute
              </div>
              <div>
                <span className="font-medium text-slate-700">Instant:</span>{" "}
                review averages and Livability on every review event
              </div>
            </div>
          </MiniCard>
        </div>

        {/* Privacy */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Lock className="h-4 w-4 text-slate-500" />
            <div className="text-sm font-semibold text-slate-900">
              Sign-in &amp; privacy
            </div>
            <Badge variant="secondary">Google OAuth</Badge>
            <Badge variant="secondary">HTTP-only cookie</Badge>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            Signing in lets you write and manage reviews. We request only basic
            profile info — name, email, and profile photo — to label your
            reviews publicly. We never see your Google password or access
            anything beyond that scope.
          </p>

          <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">
              Technical details
            </summary>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                After Google sign-in, the server verifies your ID token and
                issues a signed session stored in an HTTP-only cookie named{" "}
                <Mono>ci_session</Mono> (7-day expiry). The cookie is sent
                automatically with every subsequent request.
              </p>
              <p>
                Because it's HTTP-only, the token is invisible to JavaScript —
                limiting XSS token-theft risk. State-changing requests
                (POST/PUT/PATCH/DELETE) additionally require an{" "}
                <Mono>X-Requested-With: XMLHttpRequest</Mono> header as a
                lightweight CSRF guard. Signing out invalidates the session
                immediately.
              </p>
            </div>
          </details>
        </div>
      </SectionCard>

      {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 pb-10 pt-2 text-center">
        <p className="text-sm text-slate-600">
          Now you know how it works — go see for yourself.
        </p>
        <Button asChild variant="primary" size="lg">
          <Link to="/cities">Browse California Cities</Link>
        </Button>
      </div>
    </div>
  );
}
