import { useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { cn } from "@/utils/utils";

const DIMENSIONS = [
  { key: "safety", label: "Safety" },
  { key: "affordability", label: "Affordability" },
  { key: "walkability", label: "Walkability" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "overall", label: "Overall" },
];

/** Radar/spider chart for city livability dimensions.
 *  Optionally overlays a second city for comparison.
 */
export default function CityRadarChart({
  averages,
  label = "City",
  compareAverages = null,
  compareLabel = "Compare",
  height = 280,
  className,
}) {
  const data = useMemo(() => {
    if (!averages) return null;
    return DIMENSIONS.map(({ key, label: subject }) => ({
      subject,
      a: averages[key] ?? null,
      b: compareAverages ? (compareAverages[key] ?? null) : null,
    }));
  }, [averages, compareAverages]);

  // Show empty state if no meaningful data
  const hasData = data && data.some((d) => d.a != null && d.a > 0);
  if (!hasData) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-slate-500">
        No rating data yet.
      </div>
    );
  }

  // Null values render as 0 so the polygon doesn't crash
  const safeData = data.map((d) => ({
    ...d,
    a: d.a ?? 0,
    b: d.b ?? 0,
  }));

  const primaryColor = "hsl(199 97% 55%)"; // slightly deeper than --primary for better visibility
  const compareColor = "hsl(0 84% 60%)";   // matches --destructive

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={safeData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <Tooltip
            formatter={(value, name) => [
              value === 0 ? "—" : `${Number(value).toFixed(1)}/10`,
              name === "a" ? label : compareLabel,
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            }}
          />
          {compareAverages && (
            <Legend
              formatter={(value) => (value === "a" ? label : compareLabel)}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
          )}
          <Radar
            name="a"
            dataKey="a"
            stroke={primaryColor}
            fill={primaryColor}
            fillOpacity={0.15}
            dot={false}
          />
          {compareAverages && (
            <Radar
              name="b"
              dataKey="b"
              stroke={compareColor}
              fill={compareColor}
              fillOpacity={0.15}
              dot={false}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
