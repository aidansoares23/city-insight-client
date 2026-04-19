import PageHero from "@/components/layout/PageHero";
import SectionCard from "@/components/layout/SectionCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { FileText, AlertTriangle, UserCircle, RefreshCcw } from "lucide-react";

export default function Terms() {
  usePageTitle("Terms of Use");

  return (
    <div className="space-y-6">
      <PageHero
        title="Terms of Use"
        description="Last updated April 8, 2026. By using City Insight you agree to these terms. This is a student project for educational purposes — please use it accordingly."
        nav={[
          { href: "#use", label: "Acceptable use" },
          { href: "#content", label: "Your content" },
          { href: "#data", label: "Data accuracy" },
          { href: "#disclaimer", label: "Disclaimer" },
        ]}
      />

      <div id="use" className="scroll-mt-32" />
      <SectionCard
        title="Acceptable use"
        icon={UserCircle}
        subtitle="What you may and may not do on City Insight."
      >
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <p>You agree to use City Insight only for lawful purposes. You may not:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Submit false, misleading, or defamatory reviews.</li>
            <li>
              Create multiple accounts to circumvent the one-review-per-city
              rule or otherwise manipulate scores.
            </li>
            <li>
              Attempt to scrape, reverse-engineer, or overload any part of the
              service.
            </li>
            <li>
              Use the service in any way that violates applicable law or the
              rights of others.
            </li>
          </ul>
          <p>
            We reserve the right to remove content or suspend accounts that
            violate these terms.
          </p>
        </div>
      </SectionCard>

      <div id="content" className="scroll-mt-32" />
      <SectionCard
        title="Your content"
        icon={FileText}
        subtitle="Ownership and display of reviews you submit."
      >
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <p>
            You retain ownership of any reviews and written notes you submit.
            By submitting content, you grant City Insight a non-exclusive,
            royalty-free license to display that content on the platform.
          </p>
          <p>
            Reviews are displayed publicly alongside your Google display name
            and profile photo. Do not include sensitive personal information in
            review text.
          </p>
          <p>
            You may edit or delete your reviews at any time. Deleted content is
            removed from public display immediately, though brief propagation
            delays may occur.
          </p>
        </div>
      </SectionCard>

      <div id="data" className="scroll-mt-32" />
      <SectionCard
        title="Data accuracy"
        icon={RefreshCcw}
        subtitle="Limitations of the information we provide."
      >
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <p>
            City Insight aggregates data from public sources (U.S. Census, FBI
            Crime Data Explorer, OpenAQ) and community reviews. This data is
            provided for informational and educational purposes only.
          </p>
          <p>
            Public dataset values may lag by one to five years. Community
            reviews reflect individual opinions. Scores and rankings change as
            new data is ingested.
          </p>
          <p>
            Do not rely solely on City Insight when making housing, relocation,
            or financial decisions. Always verify information through official
            and up-to-date sources.
          </p>
        </div>
      </SectionCard>

      <div id="disclaimer" className="scroll-mt-32" />
      <SectionCard
        title="Disclaimer"
        icon={AlertTriangle}
        subtitle="No warranties — this is a student project."
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-amber-800">
          <p>
            City Insight is provided <strong>as-is</strong>, without any
            warranty of accuracy, completeness, or fitness for a particular
            purpose. The project team makes no guarantees about uptime,
            data correctness, or continued availability of the service.
          </p>
          <p className="mt-3">
            To the fullest extent permitted by law, the project team is not
            liable for any damages arising from your use of or reliance on
            information provided by City Insight.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
