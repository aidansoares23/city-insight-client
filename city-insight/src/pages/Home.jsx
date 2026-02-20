import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { MapPin, Shield, DollarSign, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6">
      <div className="py-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl text-center">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/50" />

            <div className="relative space-y-7 sm:space-y-9">
              {/* Logo + wordmark */}
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <img
                  src="/city-insight-logo.png"
                  alt="City Insight"
                  className="h-12 w-12 shrink-0 object-contain drop-shadow-sm sm:h-14 sm:w-14 lg:h-16 lg:w-16"
                />
                <div className="brand-font text-4xl font-semibold leading-none text-slate-900 sm:text-3xl">
                  City Insight
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-4 sm:space-y-5">
                <div
                  className="
                    brand-font
                    mx-auto
                    max-w-xl
                    text-2xl
                    sm:text-3xl
                    md:text-2xl
                    lg:text-2xl
                    font-semibold
                    leading-tight
                    tracking-tight
                    text-slate-900
"
                >
                  Compare California Cities{" "}
                  <span className="block sm:inline">
                    Using{" "}
                    <span className="bg-sky-400 bg-clip-text text-transparent">
                      Real Data
                    </span>{" "}
                    and{" "}
                    <span className="bg-sky-400 bg-clip-text text-transparent">
                      Real Reviews
                    </span>
                  </span>
                </div>

                <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Make informed decisions about where to live with crowdsourced
                  insights and objective metrics covering safety, cost of
                  living, and quality of life.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-center sm:gap-4">
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="group w-full sm:w-auto"
                >
                  <Link
                    to="/cities"
                    className="flex items-center justify-center gap-2"
                  >
                    <span>Find Your Next City</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link
                    to="/login"
                    className="flex items-center justify-center"
                  >
                    <span>Or Create An Account</span>
                  </Link>
                </Button>
              </div>

              {/* Cards */}
              <div className="grid gap-4 pt-2 sm:gap-6 md:grid-cols-3">
                <Card className="border-slate-200/70 bg-white/80 shadow-l">
                  <CardContent className="p-5 sm:p-6 text-left">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-900">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 ring-1 ring-blue-200/60">
                        <Shield className="h-5 w-5" />
                      </span>
                      Safety snapshot
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      Quick comparisons across cities with consistent
                      indicators.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70 bg-white/80 shadow-l">
                  <CardContent className="p-5 sm:p-6 text-left">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-900">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-200/60">
                        <DollarSign className="h-5 w-5" />
                      </span>
                      Rent + cost
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      Use median rent as a simple cost-of-living proxy.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70 bg-white/80 shadow-l">
                  <CardContent className="p-5 sm:p-6 text-left">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-900">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600/10 text-rose-700 ring-1 ring-rose-200/60">
                        <MapPin className="h-5 w-5" />
                      </span>
                      Real reviews
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      See what people say and weigh it against the data.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* (optional) if you want more breathing room below hero on desktop */}
          {/* <div className="h-10" /> */}
        </div>
      </div>
    </div>
  );
}
