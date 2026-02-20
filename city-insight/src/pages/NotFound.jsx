import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home as HomeIcon } from "lucide-react";

function nicePathname(pathname) {
  const raw = typeof pathname === "string" ? pathname : "";
  const safe = raw.trim() || "/";
  // Prevent overflow on mobile
  return safe.length > 48 ? safe.slice(0, 48) + "…" : safe;
}

export default function NotFound() {
  const location = useLocation();
  const path = nicePathname(location?.pathname);

  return (
    <div className="container mx-auto px-6">
      <div className="min-h-[calc(100vh-64px)] flex items-center py-8">
        <div className="mx-auto w-full max-w-5xl text-center">
          <div className="relative">
            {/* OUTER WRAPPER*/}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-sm backdrop-blur sm:p-12">
              {/* subtle inner highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/50" />

              <div className="relative space-y-10">
                {/* Headline */}
                <div className="space-y-5">
                  <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/15 text-sky-700 ring-1 ring-sky-200/70">
                      404
                    </span>
                    Page not found
                  </p>

                  <h1 className="brand-font text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.1] text-slate-900">
                    That route doesn’t exist.
                  </h1>

                  <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
                    We couldn’t find{" "}
                    <span className="font-mono text-slate-800">{path}</span>. It
                    may have been moved, renamed, or never existed.
                  </p>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                  <Button
                    asChild
                    variant="primary"
                    size="lg"
                    className="group gap-3 px-7"
                  >
                    <Link to="/cities">
                      <span>Browse Cities</span>
                      <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="secondary"
                    size="lg"
                    className="gap-2 px-7"
                  >
                    <Link to="/">
                      <HomeIcon className="h-4 w-4" />
                      <span>Back to Home</span>
                    </Link>
                  </Button>
                </div>

                {/* tiny helper */}
                <p className="text-xs text-slate-500">
                  Tip: If you typed the URL manually, check for typos.
                </p>
              </div>
            </div>
            {/* /OUTER WRAPPER */}
          </div>
        </div>
      </div>
    </div>
  );
}
