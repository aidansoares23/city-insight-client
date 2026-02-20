import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/authContext";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import SectionCard from "@/components/layout/SectionCard";
import PageHero from "@/components/layout/PageHero";

import { LogIn, User, ChevronRight, ShieldCheck, Lock } from "lucide-react";
import { safeReturnTo } from "@/lib/routing";

export default function Login() {
  const { user, loginWithGoogleIdToken, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = safeReturnTo(location.state?.returnTo) || "/account";

  usePageTitle(user ? "Signed in" : "Sign in");

  return (
    <>
      <PageHero
        title={user ? "You’re signed in" : "Sign in"}
        description={
          user
            ? "Continue to your destination, or sign out."
            : "Sign in with Google to write reviews and manage your account."
        }
        aside={
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            {user ? (
              <>
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                Signed in
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-slate-500" />
                Secure Google sign-in below
              </>
            )}
          </div>
        }
      />

      <div className="space-y-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* MAIN */}
        <div className="space-y-6">
          {user ? (
            <SectionCard
              icon={User}
              title="Account"
              subtitle="You’re authenticated and ready to go."
              action={
                <Button variant="outline" onClick={logout}>
                  Sign out
                </Button>
              }
            >
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Signed in as{" "}
                  <span className="font-semibold text-slate-900">
                    {user.displayName || user.email}
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    onClick={() => navigate(returnTo, { replace: true })}
                    className="transition-transform hover:scale-[1.02] active:scale-[0.99]"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/account", { replace: true })}
                  >
                    Go to account
                  </Button>
                </div>
              </div>
            </SectionCard>
          ) : (
            <SectionCard
              icon={LogIn}
              title="Continue with Google"
              subtitle="Fast sign-in, no password to remember."
            >
              <div className="space-y-4">
                {/* Google button: keep it left-aligned like your other actions */}
                <div className="flex justify-center">
                  <div className="w-full sm:max-w-[380px]">
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
                        }
                      }}
                      onError={() => console.error("Google Login Error")}
                      size="large"
                      text="continue_with"
                      shape="pill"
                      width={290}
                      logo_alignment="left"
                    />
                  </div>
                </div>

                {/* trust text, tighter + matches your design language */}
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-600">
                  We only use Google to create your account and associate your
                  reviews. After signing in, you’ll return to{" "}
                  <span className="font-semibold text-slate-800">
                    {returnTo}
                  </span>
                  .
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </>
  );
}
