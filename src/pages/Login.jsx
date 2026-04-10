import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/auth/authContext";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { usePageTitle } from "@/hooks/usePageTitle";

import {
  User,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Shield,
  Star,
  BookOpen,
} from "lucide-react";
import { safeReturnTo } from "@/lib/routing";

const FLOATING_PINS = [
  { name: "San Francisco",    left: "4%",  top: "12%", anim: "A", delay: "0s",   dur: "11s" },
  { name: "Los Angeles",      left: "86%", top: "60%", anim: "B", delay: "1.4s", dur: "13s" },
  { name: "San Diego",        left: "69%", top: "7%",  anim: "C", delay: "2.2s", dur: "10s" },
  { name: "Sacramento",       left: "12%", top: "71%", anim: "A", delay: "0.6s", dur: "14s" },
  { name: "San Jose",         left: "51%", top: "83%", anim: "B", delay: "3.8s", dur: "12s" },
  { name: "Oakland",          left: "90%", top: "27%", anim: "C", delay: "1.8s", dur: "11s" },
  { name: "Fresno",           left: "37%", top: "3%",  anim: "A", delay: "5.0s", dur: "10s" },
  { name: "Long Beach",       left: "1%",  top: "43%", anim: "B", delay: "2.8s", dur: "13s" },
  { name: "Irvine",           left: "76%", top: "47%", anim: "C", delay: "4.4s", dur: "9s"  },
  { name: "Bakersfield",      left: "24%", top: "87%", anim: "A", delay: "6.2s", dur: "12s" },
  { name: "Riverside",        left: "57%", top: "36%", anim: "B", delay: "7.0s", dur: "11s" },
  { name: "Santa Ana",        left: "42%", top: "54%", anim: "C", delay: "3.2s", dur: "10s" },
];

function FloatingCityPins() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLOATING_PINS.map(({ name, left, top, anim, delay, dur }) => (
        <div
          key={name}
          className="absolute flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 whitespace-nowrap select-none shadow-sm"
          style={{
            left,
            top,
            animationName: `homePin${anim}`,
            animationDuration: dur,
            animationTimingFunction: "ease-in-out",
            animationDelay: delay,
            animationIterationCount: "infinite",
            animationFillMode: "backwards",
          }}
        >
          <MapPin className="h-3 w-3 shrink-0" />
          {name}
        </div>
      ))}
    </div>
  );
}

const PERKS = [
  { icon: BookOpen, label: "Write reviews for cities you've lived in" },
  { icon: Shield,   label: "Your profile stays private by default" },
  { icon: Star,     label: "Track and compare your favorite cities" },
];

export default function Login() {
  const { user, loginWithGoogleIdToken, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = safeReturnTo(location.state?.returnTo) || "/account";
  const [error, setError] = useState("");

  usePageTitle(user ? "Signed in" : "Sign in");

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <FloatingCityPins />

      <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300">
          {user ? (
            /* ── Signed-in state ── */
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur">
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/50" />

              {/* Header */}
              <div className="relative bg-[hsl(var(--secondary))] px-6 py-6">
                <div className="pointer-events-none absolute inset-0 rounded-t-3xl ring-1 ring-inset ring-slate-900/5" />
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-500" />
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                    You're signed in
                  </h1>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Continue to your destination, or sign out.
                </p>
              </div>

              {/* Content */}
              <div className="space-y-4 bg-white px-6 py-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Signed in as{" "}
                  <span className="font-semibold text-slate-900">
                    {user.displayName || user.email}
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate(returnTo, { replace: true })}
                    className="group"
                  >
                    Continue
                    <ChevronRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate("/account", { replace: true })}
                  >
                    Go to account
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={logout}
                    className="text-slate-500"
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Sign-in state ── */
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur">
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/50" />

              {/* Brand header */}
              <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/city-insight-logo.png"
                    alt="City Insight"
                    className="h-10 w-10 shrink-0 object-contain drop-shadow-sm"
                  />
                  <span className="brand-font text-2xl font-semibold text-slate-900">
                    City Insight
                  </span>
                </div>

                <div className="text-center">
                  <h1 className="text-xl font-semibold text-slate-900">
                    Welcome
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Sign in to write reviews and manage your account.
                  </p>
                </div>
              </div>

              <div className="mx-6 border-t border-slate-100" />

              {/* Sign-in section */}
              <div className="space-y-4 px-6 py-5">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={async (res) => {
                      try {
                        const idToken = res.credential;
                        if (!idToken) throw new Error("Missing Google Credential");
                        await loginWithGoogleIdToken(idToken);
                        navigate(returnTo, { replace: true });
                      } catch (e) {
                        console.error(e);
                        setError("Sign-in failed. Please try again.");
                      }
                    }}
                    onError={(err) => {
                      console.error("Google Login Error", err);
                      setError("Sign-in failed. Please try again.");
                    }}
                    size="large"
                    text="continue_with"
                    shape="pill"
                    width={290}
                    logo_alignment="left"
                  />
                </div>

                <ErrorMessage message={error} />

                {/* Perks */}
                <div className="space-y-2 pt-1">
                  {PERKS.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 text-sm text-slate-600"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-500" />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Trust text */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
                  We only use Google to create your account and associate your
                  reviews. After signing in, you'll return to{" "}
                  <span className="font-medium text-slate-900">{returnTo}</span>
                  .
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3 text-center">
                <p className="text-xs text-slate-500">
                  No account yet?{" "}
                  <span className="font-medium text-sky-600">
                    Signing in creates one automatically.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
