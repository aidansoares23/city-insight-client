// src/pages/Methodology.jsx
import PageHero from "@/components/layout/PageHero";
import SectionCard from "@/components/layout/SectionCard";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

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

function FormulaRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="text-sm text-slate-600 sm:max-w-[68%]">{children}</div>
    </div>
  );
}

export default function Methodology() {
  usePageTitle("How It Works");

  return (
    <div className="space-y-6">
      <PageHero
        title="How it works"
        description="City Insight helps you compare cities using a mix of community reviews and a few public metrics. It's designed for quick exploration — not as a real-time authority."
      />

      {/* At a glance */}
      <SectionCard
        title="At a glance"
        icon={Info}
        subtitle="The quick version: what we show, where it comes from, and how often it updates."
      >
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <MiniCard icon={Database} title="Data sources">
            <ul className="list-disc pl-5">
              <li>
                <span className="font-medium text-slate-700">
                  Population &amp; rent:
                </span>{" "}
                U.S. Census (ACS, 5-year estimates)
              </li>
              <li>
                <span className="font-medium text-slate-700">
                  Safety score:
                </span>{" "}
                California OpenJustice crime statistics
              </li>
              <li>
                <span className="font-medium text-slate-700">Reviews:</span>{" "}
                users (1–10 ratings across 5 categories + written notes)
              </li>
            </ul>
          </MiniCard>

          <MiniCard icon={RefreshCcw} title="Update cadence">
            Public datasets refresh{" "}
            <span className="font-medium text-slate-700">once per week</span>.
            Review averages update instantly whenever a review is posted,
            edited, or deleted.
          </MiniCard>

          <MiniCard icon={Calculator} title="What we calculate">
            We maintain running city averages across all review categories and
            combine reviews, objective safety, and rent affordability into a
            single{" "}
            <span className="font-medium text-slate-700">Livability score</span>{" "}
            for quick comparison.
          </MiniCard>

          <MiniCard icon={CheckCircle2} title="If something is missing">
            We show it as{" "}
            <span className="font-medium text-slate-700">Unknown</span> (—)
            instead of guessing. Livability scores automatically reweight
            available signals when any input is absent.
          </MiniCard>
        </div>
      </SectionCard>

      {/* Scores */}
      <div id="scores" className="scroll-mt-24" />

      <SectionCard
        title="How scores are calculated"
        icon={Calculator}
        subtitle="Simple recipes for the numbers you see most often."
      >
        <div className="space-y-3">
          <FormulaRow label="Review ratings (1–10)">
            Reviewers independently rate five categories:{" "}
            <span className="font-medium text-slate-700">
              safety, cost, traffic, cleanliness,
            </span>{" "}
            and <span className="font-medium text-slate-700">overall</span>.
            Each is a direct input — overall is not computed from the others.
            City averages update in real time as reviews come in.
          </FormulaRow>

          <FormulaRow label="Safety score (0–10)">
            Derived from reported crime data: violent and property crime counts
            are averaged over 3 years, combined as a{" "}
            <span className="font-medium text-slate-700">weighted average</span>{" "}
            (violent crimes weighted 3×), then normalized per 100k residents.
            The resulting crime index is mapped linearly to a 0–10 scale. Higher
            means safer.
          </FormulaRow>

          <FormulaRow label="Livability score (0–100)">
            A blended score built from up to three signals:
            <ul className="mt-2 list-disc pl-5">
              <li>
                <span className="font-medium text-slate-700">
                  50% — review overall rating
                </span>{" "}
                (community sentiment, scaled 1–10 → 0–100)
              </li>
              <li>
                <span className="font-medium text-slate-700">
                  35% — objective safety score
                </span>{" "}
                (from crime pipeline, 0–10 → 0–100)
              </li>
              <li>
                <span className="font-medium text-slate-700">
                  15% — rent affordability
                </span>{" "}
                (lower median rent = higher score)
              </li>
            </ul>
            <span className="mt-2 block text-slate-500">
              If any signal is missing, the remaining weights are renormalized
              so the score still reflects what's available.
            </span>
          </FormulaRow>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-slate-600" />
            <div className="font-medium text-slate-900">Important note</div>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            City Insight is an exploration tool. Numbers can lag behind
            real-world changes and reflect reporting and reviewer bias. Use it
            as one input — not the only one.
          </p>
        </div>
      </SectionCard>

      {/* Metrics */}
      <div id="metrics" className="scroll-mt-24" />

      <SectionCard
        title="What the metrics mean"
        icon={BarChart3}
        subtitle="Plain-English definitions for city pages."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <StatCard icon={Users} title="Population" badge="People">
            Estimated number of people living in the city. Useful context for
            comparing places of different sizes.
          </StatCard>

          <StatCard icon={Home} title="Median rent" badge="$/month">
            A typical monthly rent estimate from Census data. Also contributes
            to the Livability score — more affordable cities score higher.
          </StatCard>

          <StatCard icon={Shield} title="Safety score" badge="0–10">
            A simplified indicator derived from a weighted average of violent
            and property crime rates per 100k residents. Higher means safer.
            Averaged over 3 years of data to reduce year-to-year noise.
          </StatCard>

          <StatCard icon={MessageCircle} title="Review ratings" badge="1–10">
            Community ratings across five independent categories: safety, cost,
            traffic, cleanliness, and overall. Each city average updates the
            moment a review is submitted or changed.
          </StatCard>
        </div>
      </SectionCard>

      {/* Sources */}
      <div id="sources" className="scroll-mt-24" />

      <SectionCard
        title="Where the data comes from"
        icon={Database}
        subtitle="Clear sources, clear cadence."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <MiniCard icon={Users} title="U.S. Census (ACS)">
            <div>
              <div>
                <span className="font-medium text-slate-700">Population:</span>{" "}
                ACS 5-year estimate
              </div>
              <div className="mt-1">
                <span className="font-medium text-slate-700">Median rent:</span>{" "}
                ACS 5-year median gross rent
              </div>
            </div>
          </MiniCard>

          <MiniCard icon={Shield} title="California OpenJustice">
            Reported violent and property crime counts are transformed into a{" "}
            <span className="font-medium text-slate-700">
              Safety score (0–10)
            </span>{" "}
            using a weighted-average crime index per 100k residents, averaged
            across 3 years.
          </MiniCard>

          <MiniCard icon={MessageCircle} title="Community reviews">
            Submitted by signed-in users. One review per user per city (edits
            replace the previous). City averages are maintained in real time —
            every create, edit, or delete immediately updates the city's stats.
          </MiniCard>

          <MiniCard icon={RefreshCcw} title="Refresh schedule">
            Public datasets (Census, crime) refresh{" "}
            <span className="font-medium text-slate-700">weekly</span>. Review
            averages and Livability scores update instantly with each review
            change.
          </MiniCard>
        </div>

        {/* Privacy */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">
              Privacy &amp; sign-in
            </div>
            <Badge variant="secondary">Google</Badge>
            <Badge variant="secondary">Secure session</Badge>
            <Lock className="ml-1 h-4 w-4 text-slate-500" />
          </div>

          <p className="mt-2 text-sm text-slate-600">
            Signing in lets you write reviews and manage your account. We only
            use basic profile info (name/email/photo) to label your reviews — we
            don't access your Google password or private data.
          </p>

          <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">
              Technical details (for recruiters)
            </summary>
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              <p>
                After Google sign-in, the server verifies your ID token and
                creates a signed session stored in an HTTP-only cookie (
                <span className="font-medium text-slate-700">ci_session</span>
                ). That cookie is sent automatically on subsequent requests.
              </p>
              <p>
                Because it's HTTP-only, the session cookie isn't accessible to
                JavaScript, reducing XSS token-theft risk. State-changing
                requests also require an{" "}
                <span className="font-medium text-slate-700">
                  X-Requested-With
                </span>{" "}
                header as a lightweight CSRF guard. Logging out clears the
                session immediately.
              </p>
            </div>
          </details>
        </div>
      </SectionCard>

      <div className="pb-10" />
    </div>
  );
}
