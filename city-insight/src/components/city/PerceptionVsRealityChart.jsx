// src/components/city/PerceptionVsRealityChart.jsx
// Simple "Perception vs Reality" comparison row (0–10 scale).
// - `user` is the crowd / review average (perception)
// - `objective` is the metric score (reality)
// The UI currently renders only the first valid row in `rows`.

function clampToUnitInterval(value) {
  // Clamp any numeric-ish input to the range [0, 1].
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function formatOneDecimal(value) {
  // Display numbers like 7.3, otherwise an em dash.
  const n = Number(value);
  return Number.isFinite(n) ? (Math.round(n * 10) / 10).toFixed(1) : "—";
}

/**
 * CompareRow
 * Renders:
 * - "Data" bar: objective score (0–10)
 * - "People say" bar: user score (0–10)
 * - A short interpretation of the gap between them
 *
 * polarity:
 * - "higher_is_better": higher score is good (e.g., safety, walkability)
 * - "higher_is_worse": higher score is bad (e.g., crime, cost)
 */
function CompareRow({ label, user, objective, polarity = "higher_is_better" }) {
  const userScore = Number(user);
  const objectiveScore = Number(objective);

  const hasUserScore = Number.isFinite(userScore);
  const hasObjectiveScore = Number.isFinite(objectiveScore);

  // If literally nothing exists, render nothing.
  if (!hasUserScore && !hasObjectiveScore) return null;

  const canCompare = hasUserScore && hasObjectiveScore;
  const scoreGap = canCompare ? userScore - objectiveScore : null; // positive => people rate higher than data

  // Convert 0–10 scale to 0–1 widths for the bars.
  const userWidth = hasUserScore ? clampToUnitInterval(userScore / 10) : 0;
  const objectiveWidth = hasObjectiveScore
    ? clampToUnitInterval(objectiveScore / 10)
    : 0;

  // Treat tiny differences as basically "the same".
  const absGap = scoreGap == null ? null : Math.abs(scoreGap);
  const isClose = absGap != null && absGap < 0.4;

  function getGapMessage() {
    if (!canCompare) return "Not enough objective data yet.";
    if (isClose) return "Feels about the same as the data suggests.";

    const peopleRateHigherThanData = scoreGap > 0;

    if (polarity === "higher_is_better") {
      return peopleRateHigherThanData
        ? "Feels better than the data suggests."
        : "Feels worse than the data suggests.";
    }

    if (polarity === "higher_is_worse") {
      return peopleRateHigherThanData
        ? "Feels worse than the data suggests."
        : "Feels better than the data suggests.";
    }

    // Fallback if an unknown polarity is passed.
    return peopleRateHigherThanData
      ? "Feels higher than the data suggests."
      : "Feels lower than the data suggests.";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">Scale: 0–10</div>
      </div>

      <div className="mt-3 space-y-3">
        {/* Objective metric ("reality") */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Data</span>
            <span className="font-medium text-slate-700">
              {hasObjectiveScore
                ? `${formatOneDecimal(objectiveScore)}/10`
                : "—"}
            </span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-400/50"
              style={{
                width: `${objectiveWidth * 100}%`,
                opacity: hasObjectiveScore ? 1 : 0.25,
              }}
            />
          </div>
        </div>

        {/* Crowd perception ("people say") */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">People say</span>
            <span className="font-medium text-slate-900">
              {hasUserScore ? `${formatOneDecimal(userScore)}/10` : "—"}
            </span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[hsl(var(--primary))]"
              style={{
                width: `${userWidth * 100}%`,
                opacity: hasUserScore ? 1 : 0.25,
              }}
            />
          </div>
        </div>

        {/* Interpretation */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
          <span className="text-slate-600">Feels vs data</span>
          <span className="font-semibold text-slate-900">
            {getGapMessage()}
            {canCompare ? (
              <span className="ml-2 font-medium text-slate-500">
                ({scoreGap > 0 ? "+" : ""}
                {formatOneDecimal(scoreGap)})
              </span>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PerceptionVsRealityChart({ rows }) {
  // Keep only rows that have at least one meaningful value.
  const validRows = (Array.isArray(rows) ? rows : []).filter(
    (row) => row?.user != null || row?.objective != null,
  );

  if (!validRows.length) {
    return <div className="text-sm text-slate-600">Not enough data yet.</div>;
  }

  // Current UI intentionally shows only the first row (simple/compact).
  const firstRow = validRows[0];

  return (
    <div className="w-full">
      <CompareRow
        label={firstRow.label || "Safety"}
        user={firstRow.user}
        objective={firstRow.objective}
        polarity={firstRow.polarity || "higher_is_better"}
      />
    </div>
  );
}
