import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button.jsx";
import { Card, CardContent } from "@/components/ui/Card.jsx";
import { MapPin, Shield, DollarSign, ArrowRight } from "lucide-react";
import { FLOATING_PINS } from "@/lib/floating-pins";


function FloatingCityPins() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0">
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
    </>
  );
}

export default function Home() {
  return (
    <div className="relative flex-1 overflow-hidden flex flex-col">
      <FloatingCityPins />

      <div className="container mx-auto px-4 sm:px-6 flex flex-col flex-1 justify-center gap-4">
        {/* Hero */}
        <div className="text-center space-y-3 sm:space-y-4">
          {/* Headline */}
          <div className="home-enter-1 space-y-3">
            <h1 className="brand-font mx-auto max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-slate-900">
              Compare California Cities Using{" "}
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                Real Data
              </span>{" "}
              and{" "}
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                Real Reviews
              </span>
            </h1>

            <p className="mx-auto max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
              Crowdsourced insights and objective metrics on safety, cost of
              living, and quality of life.
            </p>
          </div>

          {/* CTA */}
          <div className="home-enter-2 flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center sm:gap-3">
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
              <Link to="/login" className="flex items-center justify-center">
                <span>Sign Up Free</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            <Card className="home-enter-3 border-slate-400/70 bg-white/80 shadow-sm">
              <CardContent className="p-5 text-left">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-900">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600/10 text-sky-700 ring-1 ring-sky-200/60">
                    <Shield className="h-4 w-4" />
                  </span>
                  Safety snapshot
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                  Quick comparisons across cities with consistent indicators.
                </p>
              </CardContent>
            </Card>

            <Card className="home-enter-4 border-slate-400/70 bg-white/80 shadow-sm">
              <CardContent className="p-5 text-left">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-900">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-200/60">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  Rent + cost
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                  Use median rent as a simple cost-of-living proxy.
                </p>
              </CardContent>
            </Card>

            <Card className="home-enter-5 border-slate-400/70 bg-white/80 shadow-sm">
              <CardContent className="p-5 text-left">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-900">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600/10 text-rose-700 ring-1 ring-rose-200/60">
                    <MapPin className="h-4 w-4" />
                  </span>
                  Real reviews
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                  See what people say and weigh it against the data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
