// src/pages/Methodology.jsx
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
} from "lucide-react";

function Pill({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-xs">
      {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
      <span>{children}</span>
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

function FormulaRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="text-sm text-slate-600 sm:max-w-[68%]">{children}</div>
    </div>
  );
}

export default function Methodology() {
  usePageTitle("How it works — City Insight");

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="How it works"
        description="City Insight helps you compare cities using a mix of community reviews and a few public metrics. It’s designed for quick exploration — not as a real-time authority."
      />

      <SectionCard
        title="At a glance"
        icon={Info}
        subtitle="The quick version: what we show, where it comes from, and how often it updates."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => scrollToId("scores")}>
              <Calculator className="h-4 w-4" />
              Scores
            </Button>
            <Button variant="outline" onClick={() => scrollToId("metrics")}>
              <BarChart3 className="h-4 w-4" />
              Metrics
            </Button>
            <Button onClick={() => scrollToId("sources")}>
              <Database className="h-4 w-4" />
              Sources
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Pill icon={MessageCircle}>Community reviews</Pill>
          <Pill icon={Database}>Public datasets</Pill>
          <Pill icon={RefreshCcw}>Weekly refresh</Pill>
          <Pill icon={AlertTriangle}>Unknown if missing</Pill>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <MiniCard icon={Database} title="Data sources">
            <ul className="list-disc pl-5">
              <li>
                <span className="font-medium text-slate-700">
                  Population & rent:
                </span>{" "}
                U.S. Census (ACS, 3-year estimates)
              </li>
              <li>
                <span className="font-medium text-slate-700">
                  Safety score:
                </span>{" "}
                California OpenJustice crime statistics
              </li>
              <li>
                <span className="font-medium text-slate-700">Reviews:</span>{" "}
                users (1–10 ratings + written notes)
              </li>
            </ul>
          </MiniCard>

          <MiniCard icon={RefreshCcw} title="Update cadence">
            Public datasets refresh{" "}
            <span className="font-medium text-slate-700">once per week</span>.
            Review averages update whenever new reviews are posted, edited, or
            deleted.
          </MiniCard>

          <MiniCard icon={Calculator} title="What we calculate">
            We summarize reviews into city averages, and we combine reviews +
            safety into a single{" "}
            <span className="font-medium text-slate-700">Livability score</span>{" "}
            for quick comparison.
          </MiniCard>

          <MiniCard icon={CheckCircle2} title="If something is missing">
            We show it as{" "}
            <span className="font-medium text-slate-700">Unknown</span> (—)
            instead of guessing. Some scores may rely more heavily on available
            data.
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
          <FormulaRow label="Overall rating (1–10)">
            The average of the four category ratings:
            <span className="font-medium text-slate-700">
              {" "}
              safety, cost, traffic, cleanliness
            </span>
            . (This is the “overall vibe” from reviewers.)
          </FormulaRow>

          <FormulaRow label="Safety score (0–100)">
            A simplified score derived from reported crime statistics. Higher
            generally means safer. It’s meant for comparison — not real-time
            safety monitoring.
          </FormulaRow>

          <FormulaRow label="Livability score (0–100)">
            A blended “at a glance” score using:
            <span className="font-medium text-slate-700">
              {" "}
              review sentiment (overall rating)
            </span>{" "}
            +{" "}
            <span className="font-medium text-slate-700">objective safety</span>
            . If one input is missing, the score leans more on what’s available.
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
            Estimated number of people living in the city (useful context for
            comparing places).
          </StatCard>

          <StatCard icon={Home} title="Median rent" badge="$/month">
            A typical monthly rent estimate (useful for cost-of-living
            comparison).
          </StatCard>

          <StatCard icon={Shield} title="Safety score" badge="0–100">
            A simplified safety indicator derived from crime statistics. Higher
            generally means safer.
          </StatCard>

          <StatCard icon={MessageCircle} title="Review ratings" badge="1–10">
            Community ratings for safety, cost, traffic, and cleanliness — plus
            an overall average.
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
                ACS 3-year estimate
              </div>
              <div className="mt-1">
                <span className="font-medium text-slate-700">Median rent:</span>{" "}
                ACS 3-year median
              </div>
            </div>
          </MiniCard>

          <MiniCard icon={Shield} title="California OpenJustice">
            Reported crime statistics are transformed into a simplified{" "}
            <span className="font-medium text-slate-700">
              Safety score (0–100)
            </span>{" "}
            for comparison.
          </MiniCard>

          <MiniCard icon={MessageCircle} title="Community reviews">
            Reviews are submitted by users. We compute city averages so you can
            quickly see the trend.
          </MiniCard>

          <MiniCard icon={RefreshCcw} title="Refresh schedule">
            Public datasets refresh{" "}
            <span className="font-medium text-slate-700">weekly</span>. Review
            averages update as reviews are added.
          </MiniCard>
        </div>

        {/* Privacy */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">
              Privacy & sign-in
            </div>
            <Badge variant="secondary">Google</Badge>
            <Badge variant="secondary">Secure session</Badge>
            <Lock className="ml-1 h-4 w-4 text-slate-500" />
          </div>

          <p className="mt-2 text-sm text-slate-600">
            Signing in lets you write reviews and manage your account. We only
            use basic profile info (name/email/photo) to label your reviews — we
            don’t access your Google password or private data.
          </p>

          <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">
              Technical details (for recruiters)
            </summary>
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              <p>
                After Google sign-in, the server creates a secure session using
                an HTTP-only cookie. That cookie is sent automatically on
                requests like{" "}
                <span className="font-medium text-slate-700">/api/me</span>.
              </p>
              <p>
                Because it’s HTTP-only, the session cookie isn’t accessible to
                JavaScript (reduces XSS token theft risk). Logging out clears
                the session.
              </p>
            </div>
          </details>
        </div>
      </SectionCard>

      <div className="pb-10" />
    </div>
  );
}
