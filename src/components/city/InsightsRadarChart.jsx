import { useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/utils/utils";
import { safeNumOrNull } from "@/lib/format";
import { RATING_KEYS } from "@/lib/ratings";
import {
  COLOR_SUBJECTIVE,
  COLOR_OBJECTIVE,
  CHART_GRID_COLOR,
  CHART_TICK_NORMAL,
  CHART_TICK_MUTED,
} from "@/lib/chartColors";

const RATING_KEY_META = {
  safety:        { objectiveKey: "safetyScore", muted: false },
  affordability: { objectiveKey: "costScore",   muted: false },
  walkability:   { objectiveKey: null,          muted: true  },
  cleanliness:   { objectiveKey: null,          muted: true  },
};

const DIMENSIONS = [
  ...RATING_KEYS.map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    ...RATING_KEY_META[key],
  })),
  { key: "overall", label: "Overall", objectiveKey: null, muted: true },
];


function InsightsTooltip({ active, payload, label, hasAnyObjective }) {
  if (!active || !payload?.length) return null;
  const dim = DIMENSIONS.find((d) => d.label === label);
  const dp  = payload[0]?.payload;
  const fmt = (v) => (v == null ? "N/A" : `${Number(v).toFixed(1)}/10`);

  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${CHART_GRID_COLOR}`,
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
        minWidth: 180,
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 4, color: "hsl(198 23% 15%)" }}>  {/* deep --muted-foreground */}
        {label}
      </p>
      <p style={{ color: COLOR_SUBJECTIVE }}>
        What People Say: {fmt(dp?._subjectiveRaw)}
      </p>
      {hasAnyObjective && (
        <p style={{ color: COLOR_OBJECTIVE }}>
          What Data Shows:{" "}
          {dim?.objectiveKey ? fmt(dp?._objectiveRaw) : "N/A"}
        </p>
      )}
      {dim?.muted && (
        <p
          style={{
            color: CHART_TICK_MUTED,
            fontStyle: "italic",
            marginTop: 4,
            fontSize: 11,
          }}
        >
          No objective data for this category
        </p>
      )}
    </div>
  );
}

function CustomAxisTick({ x, y, payload, textAnchor }) {
  const dim = DIMENSIONS.find((d) => d.label === payload.value);
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill={dim?.muted ? CHART_TICK_MUTED : CHART_TICK_NORMAL}
      fontSize={11}
      fontStyle={dim?.muted ? "italic" : "normal"}
    >
      {payload.value}
    </text>
  );
}

export default function InsightsRadarChart({
  avgRatings,
  metrics,
  reviewCount,
  height = 340,
  className,
}) {
  const chartData = useMemo(
    () =>
      DIMENSIONS.map(({ key, label, objectiveKey }) => {
        const subjectiveRaw = safeNumOrNull(avgRatings?.[key]);
        const objectiveRaw  = objectiveKey ? safeNumOrNull(metrics?.[objectiveKey]) : null;
        return {
          subject:        label,
          subjective:     subjectiveRaw ?? 0,
          objective:      objectiveRaw  ?? 0,
          _subjectiveRaw: subjectiveRaw,
          _objectiveRaw:  objectiveRaw,
        };
      }),
    [avgRatings, metrics],
  );

  const hasAnySubjective = chartData.some(
    (d) => d._subjectiveRaw != null && d._subjectiveRaw > 0,
  );

  const hasAnyObjective = chartData.some((d) => d._objectiveRaw != null);

  if (!hasAnySubjective) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-slate-500">
        No rating data yet.
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke={CHART_GRID_COLOR} />
          <PolarAngleAxis dataKey="subject" tick={<CustomAxisTick />} />
          <Tooltip content={<InsightsTooltip hasAnyObjective={hasAnyObjective} />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Radar
            name="What People Say"
            dataKey="subjective"
            stroke={COLOR_SUBJECTIVE}
            fill={COLOR_SUBJECTIVE}
            fillOpacity={0.18}
            dot={false}
          />
          {hasAnyObjective && (
            <Radar
              name="What Data Shows"
              dataKey="objective"
              stroke={COLOR_OBJECTIVE}
              fill={COLOR_OBJECTIVE}
              fillOpacity={0.10}
              dot={false}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
      {reviewCount != null && reviewCount > 0 && (
        <p className="mt-1 text-center text-xs text-slate-400">
          &ldquo;What People Say&rdquo; based on {reviewCount}{" "}
          {reviewCount === 1 ? "review" : "reviews"}
        </p>
      )}
    </div>
  );
}
