import PageHero from "@/components/layout/PageHero";
import SectionCard from "@/components/layout/SectionCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Lock, Database, UserCircle, Mail, RefreshCcw } from "lucide-react";

export default function PrivacyPolicy() {
  usePageTitle("Privacy Policy");

  return (
    <div className="space-y-6">
      <PageHero
        title="Privacy Policy"
        description="Last updated April 8, 2026. City Insight is a student project built for educational purposes. This policy explains what data we collect and how we use it."
        nav={[
          { href: "#collect", label: "What we collect" },
          { href: "#use", label: "How we use it" },
          { href: "#store", label: "Storage & retention" },
          { href: "#contact", label: "Contact" },
        ]}
      />

      <div id="collect" className="scroll-mt-32" />
      <SectionCard
        title="What we collect"
        icon={Database}
        subtitle="We request the minimum information needed to run the service."
      >
        <div className="space-y-4 text-sm leading-relaxed text-slate-600">
          <div>
            <p className="font-semibold text-slate-900">Google Sign-In</p>
            <p className="mt-1">
              When you sign in with Google, we receive your name, email address,
              and profile photo from Google. We never see your Google password.
              We store only what is needed to identify your account and label
              your reviews publicly.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Reviews you submit</p>
            <p className="mt-1">
              City ratings (safety, affordability, walkability, cleanliness)
              and any optional written notes you provide are stored and displayed
              publicly alongside your display name and profile photo.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Usage data</p>
            <p className="mt-1">
              We do not run third-party analytics trackers. Standard server logs
              (IP address, browser type, pages visited) may be retained briefly
              for debugging purposes only.
            </p>
          </div>
        </div>
      </SectionCard>

      <div id="use" className="scroll-mt-32" />
      <SectionCard
        title="How we use your data"
        icon={UserCircle}
        subtitle="Your data is used only to operate City Insight — nothing else."
      >
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <p>We use your information to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Authenticate you and associate reviews with your account.</li>
            <li>Display your name and photo next to reviews you have written.</li>
            <li>
              Enforce the one-review-per-city rule so scores remain fair.
            </li>
            <li>Generate aggregate city scores from community ratings.</li>
          </ul>
          <p>
            We do not sell, rent, or share your personal information with third
            parties for marketing purposes. We do not use your data to train AI
            models.
          </p>
        </div>
      </SectionCard>

      <div id="store" className="scroll-mt-32" />
      <SectionCard
        title="Storage & retention"
        icon={Lock}
        subtitle="Where data lives and how long we keep it."
      >
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <p>
            Account information and reviews are stored in{" "}
            <span className="font-semibold text-slate-900">Google Firestore</span>
            , a cloud database operated by Google. Data is retained for as long
            as your account exists.
          </p>
          <p>
            You may delete your reviews at any time from the city page or your
            account page. To request full account deletion, contact us at the
            address below and we will remove your data within 30 days.
          </p>
          <p>
            City Insight is a student project and may be taken offline at any
            time. We make no guarantees about long-term data retention.
          </p>
        </div>
      </SectionCard>

      <div id="contact" className="scroll-mt-32" />
      <SectionCard
        title="Contact"
        icon={Mail}
        subtitle="Questions about your data? Reach out."
      >
        <p className="text-sm leading-relaxed text-slate-600">
          This project is maintained by OSU students. If you have questions or
          requests regarding your personal data, please open an issue on the
          project repository or contact the project team directly through your
          course channel.
        </p>
      </SectionCard>
    </div>
  );
}
