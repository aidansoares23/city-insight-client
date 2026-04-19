import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Shield, DollarSign, ArrowRight } from "lucide-react";

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
  {
    name: "Anaheim",
    left: "18%",
    top: "30%",
    anim: "B",
    delay: "8.0s",
    dur: "13s",
  },
  {
    name: "Chula Vista",
    left: "80%",
    top: "80%",
    anim: "A",
    delay: "5.6s",
    dur: "11s",
  },
  {
    name: "Stockton",
    left: "31%",
    top: "20%",
    anim: "C",
    delay: "0.4s",
    dur: "10s",
  },
  {
    name: "Fremont",
    left: "63%",
    top: "67%",
    anim: "A",
    delay: "4.0s",
    dur: "12s",
  },
  {
    name: "Modesto",
    left: "8%",
    top: "57%",
    anim: "B",
    delay: "6.8s",
    dur: "11s",
  },
  {
    name: "Oxnard",
    left: "93%",
    top: "46%",
    anim: "C",
    delay: "2.0s",
    dur: "10s",
  },
  {
    name: "Huntington Beach",
    left: "47%",
    top: "15%",
    anim: "A",
    delay: "7.4s",
    dur: "13s",
  },
  {
    name: "Santa Rosa",
    left: "71%",
    top: "91%",
    anim: "B",
    delay: "1.0s",
    dur: "9s",
  },
  {
    name: "Sunnyvale",
    left: "22%",
    top: "48%",
    anim: "C",
    delay: "5.4s",
    dur: "11s",
  },
  {
    name: "Pasadena",
    left: "55%",
    top: "24%",
    anim: "A",
    delay: "3.0s",
    dur: "12s",
  },
  {
    name: "Berkeley",
    left: "84%",
    top: "13%",
    anim: "B",
    delay: "8.6s",
    dur: "10s",
  },
  {
    name: "Salinas",
    left: "35%",
    top: "75%",
    anim: "C",
    delay: "6.4s",
    dur: "13s",
  },
];

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
