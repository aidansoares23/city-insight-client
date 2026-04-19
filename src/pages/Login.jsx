import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/auth/authContext";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { usePageTitle } from "@/hooks/usePageTitle";

import {
  ChevronRight,
  MapPin,
  CheckCircle2,
  Shield,
  Star,
  BookOpen,
} from "lucide-react";
import { safeReturnTo, friendlyReturnTo } from "@/lib/routing";

const FLOATING_PINS = [
  {
    name: "San Francisco",
    left: "4%",
    top: "12%",
    anim: "A",
    delay: "0s",
    dur: "11s",
  },
  {
    name: "Los Angeles",
    left: "86%",
    top: "60%",
    anim: "B",
    delay: "1.4s",
    dur: "13s",
  },
  {
    name: "San Diego",
    left: "69%",
    top: "7%",
    anim: "C",
    delay: "2.2s",
    dur: "10s",
  },
  {
    name: "Sacramento",
    left: "12%",
    top: "71%",
    anim: "A",
    delay: "0.6s",
    dur: "14s",
  },
  {
    name: "San Jose",
    left: "51%",
    top: "83%",
    anim: "B",
    delay: "3.8s",
    dur: "12s",
  },
  {
    name: "Oakland",
    left: "90%",
    top: "27%",
    anim: "C",
    delay: "1.8s",
    dur: "11s",
  },
  {
    name: "Fresno",
    left: "37%",
    top: "3%",
    anim: "A",
    delay: "5.0s",
    dur: "10s",
  },
  {
    name: "Long Beach",
    left: "1%",
    top: "43%",
    anim: "B",
    delay: "2.8s",
    dur: "13s",
  },
  {
    name: "Irvine",
    left: "76%",
    top: "47%",
    anim: "C",
    delay: "4.4s",
    dur: "9s",
  },
  {
    name: "Bakersfield",
    left: "24%",
    top: "87%",
    anim: "A",
    delay: "6.2s",
    dur: "12s",
  },
  {
    name: "Riverside",
    left: "57%",
    top: "36%",
    anim: "B",
    delay: "7.0s",
    dur: "11s",
  },
  {
    name: "Santa Ana",
    left: "42%",
    top: "54%",
    anim: "C",
    delay: "3.2s",
    dur: "10s",
  },
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
  { icon: Shield, label: "Your profile stays private by default" },
  { icon: Star, label: "Track and compare your favorite cities" },
];

export default function Login() {
  const { user, loginWithGoogleIdToken, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = safeReturnTo(location.state?.returnTo) || "/account";
  const [error, setError] = useState("");

  usePageTitle(user ? "Signed in" : "Sign in");

  return (
    <div className="relative flex-1 overflow-hidden flex flex-col">
      <FloatingCityPins />

      <div className="relative flex flex-1 items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          {user ? (
            /* ── Signed-in state ── */
            <div className="relative overflow-hidden rounded-3xl border border-slate-400/80 bg-white/90 shadow-sm backdrop-blur">
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/50" />

              <div className="px-6 pt-6 pb-5 space-y-4">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                    You're signed in
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Signed in as{" "}
                    <span className="font-medium text-slate-700">
                      {user.displayName || user.email}
                    </span>
                  </p>
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
            <div className="relative overflow-hidden rounded-3xl border border-slate-400/80 bg-white/90 shadow-sm backdrop-blur">
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/50" />

              {/* Header */}
              <div className="px-6 pt-6 pb-5 text-center">
                <h1 className="brand-font text-2xl font-semibold leading-tight tracking-tight text-slate-900">
                  Sign in to{" "}
                  <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                    City Insight
                  </span>
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Write reviews and track your favorite cities.
                </p>
              </div>

              <div className="mx-6 border-t border-slate-100" />

              {/* Sign-in section */}
              <div className="space-y-4 px-6 py-5">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={async (res) => {
                      try {
                        const idToken = res.credential;
                        if (!idToken)
                          throw new Error("Missing Google Credential");
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
                <div className="space-y-2">
                  {PERKS.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 text-sm text-slate-500"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-500" />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Trust text */}
                <p className="text-xs leading-relaxed text-slate-400">
                  We only use Google to create your account. After signing in,
                  you'll continue to{" "}
                  <span className="font-medium text-slate-600">
                    {friendlyReturnTo(returnTo)}
                  </span>
                  . <br />
                  No account yet? One will be created for you automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
