import { useEffect } from "react";
import { Loader2, Server } from "lucide-react";

export default function ApiOverlay({ show, title, message, hint }) {
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 py-10"
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      {/* dim + blur backdrop */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" />

      {/* modal */}
      <div className="relative w-full max-w-xl">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-7 shadow-sm backdrop-blur sm:p-9">
          {/* subtle inner highlight ring */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/50" />

          <div className="relative flex gap-5">
            {/* spinner bubble */}
            <div className="mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
            </div>

            <div className="min-w-0 space-y-3">
              {/* pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/15 text-sky-700 ring-1 ring-sky-200/70">
                  <Server className="h-3.5 w-3.5" />
                </span>
                Waking up backend
              </div>

              <div className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {title ?? "Starting the server…"}
              </div>

              <div className="text-sm leading-relaxed text-slate-600 sm:text-base">
                {message ?? (
                  <>
                    This demo uses a free hosting tier, so the backend goes to
                    sleep when idle. We’re waking it up now — first load may
                    take up to ~30 seconds.
                  </>
                )}
              </div>

              <div className="text-xs text-slate-500">
                {hint ?? "If it doesn’t come back, try again in a moment."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
