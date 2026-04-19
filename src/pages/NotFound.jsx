import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home as HomeIcon } from "lucide-react";

/** Truncates a pathname to 48 characters with an ellipsis to prevent overflow on mobile. */
function nicePathname(pathname) {
  const raw = typeof pathname === "string" ? pathname : "";
  const safe = raw.trim() || "/";
  return safe.length > 48 ? safe.slice(0, 48) + "…" : safe;
}

const WIN_CLASSES = [
  "nf-win-a",
  "nf-win-b",
  "nf-win-c",
  "nf-win-d",
  "nf-win-e",
];

// Tallest building  (x=134, y=20, w=30)
const WIN_ROWS_TALL = [28, 38, 48, 58, 68, 78, 88, 98, 108, 118, 128, 138, 148];
const WIN_COLS_TALL = [138, 146];
// Narrow back tower (x=53,  y=30, w=22)
const WIN_ROWS_NARROW = [38, 48, 58, 68, 78, 88, 98, 108, 118, 128, 138, 148];
const WIN_COLS_NARROW = [57, 65];
// Right tall tower  (x=335, y=42, w=30)
const WIN_ROWS_RIGHT = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
const WIN_COLS_RIGHT = [339, 347];
// Medium building   (x=78,  y=65, w=52)
const WIN_ROWS_MED = [74, 84, 94, 104, 114, 124, 134, 144, 152];
const WIN_COLS_MED = [82, 89, 96, 103, 110, 117, 124];

function CityAnimation() {
  return (
    <div className="relative mx-auto h-44 w-full max-w-2xl overflow-hidden rounded-lg">
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        @keyframes nfWinBlink {
          0%, 35%, 100% { opacity: 1;    }
          48%, 88%      { opacity: 0.10; }
        }
        .nf-win-a { animation: nfWinBlink 3.2s ease-in-out infinite; }
        .nf-win-b { animation: nfWinBlink 2.1s ease-in-out infinite 0.7s; }
        .nf-win-c { animation: nfWinBlink 4.5s ease-in-out infinite 1.3s; }
        .nf-win-d { animation: nfWinBlink 2.8s ease-in-out infinite 0.3s; }
        .nf-win-e { animation: nfWinBlink 3.7s ease-in-out infinite 1.8s; }
        @keyframes nfCloud1 {
          from { transform: translateX(-140px); }
          to   { transform: translateX(560px);  }
        }
        @keyframes nfCloud2 {
          from { transform: translateX(-100px); }
          to   { transform: translateX(560px);  }
        }
        @keyframes nfTaxi {
          from { transform: translateX(-200px); }
          to   { transform: translateX(700px); }
        }
        @keyframes nfQBob {
          0%, 100% { transform: translateY(0px);  opacity: 0.38; }
          50%      { transform: translateY(-5px); opacity: 0.55; }
        }
      `}</style>
      <svg
        viewBox="0 0 400 176"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="nf-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="400" height="176" fill="url(#nf-sky)" />

        {/* Clouds */}
        <g style={{ animation: "nfCloud1 26s linear infinite" }}>
          <ellipse
            cx="60"
            cy="28"
            rx="32"
            ry="13"
            fill="white"
            opacity="0.92"
          />
          <ellipse
            cx="43"
            cy="33"
            rx="18"
            ry="10"
            fill="white"
            opacity="0.92"
          />
          <ellipse
            cx="78"
            cy="33"
            rx="21"
            ry="11"
            fill="white"
            opacity="0.92"
          />
        </g>
        <g style={{ animation: "nfCloud2 38s linear infinite 13s" }}>
          <ellipse
            cx="240"
            cy="20"
            rx="26"
            ry="11"
            fill="white"
            opacity="0.82"
          />
          <ellipse
            cx="224"
            cy="24"
            rx="15"
            ry="8"
            fill="white"
            opacity="0.82"
          />
          <ellipse
            cx="258"
            cy="24"
            rx="17"
            ry="9"
            fill="white"
            opacity="0.82"
          />
        </g>

        {/* ── BUILDINGS ── */}
        {/* Back layer – lighter slate */}
        <rect x="0" y="60" width="58" height="102" fill="#94a3b8" />
        <rect x="53" y="30" width="22" height="132" fill="#7c8fa5" />
        <rect x="362" y="50" width="38" height="112" fill="#94a3b8" />

        {/* Front layer – dark slate */}
        <rect x="0" y="92" width="38" height="70" fill="#475569" />
        <rect x="78" y="65" width="52" height="97" fill="#334155" />
        <rect x="134" y="20" width="30" height="142" fill="#1e293b" />
        <rect x="167" y="78" width="57" height="84" fill="#334155" />
        <rect x="227" y="56" width="42" height="106" fill="#475569" />
        <rect x="272" y="82" width="60" height="80" fill="#334155" />
        <rect x="335" y="42" width="30" height="120" fill="#1e293b" />
        <rect x="369" y="72" width="31" height="90" fill="#475569" />

        {/* Antenna */}
        <line
          x1="149"
          y1="20"
          x2="149"
          y2="5"
          stroke="#334155"
          strokeWidth="2"
        />
        <circle cx="149" cy="4" r="2.5" fill="#f87171" />

        {/* ── WINDOWS ── */}
        {WIN_ROWS_TALL.flatMap((wy, i) =>
          WIN_COLS_TALL.map((wx, j) => (
            <rect
              key={`tw-${i}-${j}`}
              x={wx}
              y={wy}
              width="5"
              height="6"
              fill="#fcd34d"
              className={WIN_CLASSES[(i * 2 + j) % 5]}
            />
          )),
        )}
        {WIN_ROWS_NARROW.flatMap((wy, i) =>
          WIN_COLS_NARROW.map((wx, j) => (
            <rect
              key={`nw-${i}-${j}`}
              x={wx}
              y={wy}
              width="5"
              height="6"
              fill="#fcd34d"
              className={WIN_CLASSES[(i + j * 3 + 2) % 5]}
            />
          )),
        )}
        {WIN_ROWS_RIGHT.flatMap((wy, i) =>
          WIN_COLS_RIGHT.map((wx, j) => (
            <rect
              key={`rw-${i}-${j}`}
              x={wx}
              y={wy}
              width="5"
              height="6"
              fill="#fcd34d"
              className={WIN_CLASSES[(i + j * 2 + 1) % 5]}
            />
          )),
        )}
        {WIN_ROWS_MED.flatMap((wy, i) =>
          WIN_COLS_MED.map((wx, j) => (
            <rect
              key={`mw-${i}-${j}`}
              x={wx}
              y={wy}
              width="4"
              height="5"
              fill="#fcd34d"
              className={WIN_CLASSES[(i + j) % 5]}
            />
          )),
        )}

        {/* ── GROUND ── */}
        <rect x="0" y="163" width="400" height="13" fill="#e2e8f0" />
        <rect x="0" y="161" width="400" height="3" fill="#cbd5e1" />
        {[18, 62, 106, 150, 194, 238, 282, 326].map((x, i) => (
          <rect
            key={`sd-${i}`}
            x={x}
            y="166"
            width="22"
            height="2"
            fill="white"
            opacity="0.65"
          />
        ))}

        {/* ── TAXI ── */}
        <g
          style={{
            animation: "nfTaxi 26s linear 1s infinite normal backwards",
          }}
        >
          {/* wheels */}
          <circle cx="6" cy="162" r="4" fill="#1e293b" />
          <circle cx="24" cy="162" r="4" fill="#1e293b" />
          <circle cx="6" cy="162" r="1.5" fill="#64748b" />
          <circle cx="24" cy="162" r="1.5" fill="#64748b" />
          {/* body */}
          <rect x="0" y="148" width="30" height="14" fill="#fbbf24" rx="2" />
          {/* roof */}
          <rect x="5" y="140" width="19" height="10" fill="#f59e0b" rx="2" />
          {/* windows */}
          <rect
            x="7"
            y="142"
            width="6"
            height="6"
            fill="#bae6fd"
            rx="1"
            opacity="0.85"
          />
          <rect
            x="15"
            y="142"
            width="6"
            height="6"
            fill="#bae6fd"
            rx="1"
            opacity="0.85"
          />
        </g>

        {/* Floating ? */}
        <text
          x="196"
          y="50"
          fontSize="26"
          fontWeight="bold"
          fill="#64748b"
          textAnchor="middle"
          style={{ animation: "nfQBob 2.6s ease-in-out infinite" }}
        >
          ?
        </text>
      </svg>
    </div>
  );
}

/** 404 page displaying the attempted path with links back to Cities and Home. */
export default function NotFound() {
  const location = useLocation();
  const path = nicePathname(location?.pathname);

  return (
    <div className="container mx-auto px-6">
      <div className="min-h-[calc(100vh-64px)] flex items-center py-8">
        <div className="mx-auto w-full max-w-5xl text-center">
          <div className="relative">
            {/* OUTER WRAPPER*/}
            <div className="relative overflow-hidden rounded-3xl border border-slate-400/80 bg-white/70 p-8 shadow-sm backdrop-blur sm:p-12">
              {/* subtle inner highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/50" />

              <div className="relative space-y-10">
                {/* City skyline animation */}
                <CityAnimation />

                {/* Headline */}
                <div className="space-y-5">
                  <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-400 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/15 text-sky-700 ring-1 ring-sky-200/70">
                      404
                    </span>
                    Page not found
                  </p>

                  <h1 className="brand-font text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.1] text-slate-900">
                    That route doesn't exist.
                  </h1>

                  <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
                    We couldn't find{" "}
                    <span className="font-mono text-slate-700">{path}</span>. It
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
