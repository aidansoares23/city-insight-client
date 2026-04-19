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
import { RATING_KEYS } from "@/lib/ratings";
import { CHART_COLORS, CHART_GRID_COLOR, CHART_TICK_NORMAL } from "@/lib/chartColors";

const DIMENSIONS = RATING_KEYS.map((key) => ({
  key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));

/** Radar/spider chart for city livability dimensions.
 *  Accepts either a `cities` array (multi-city) or legacy averages/compare props.
 */
export default function CityRadarChart({
  // Multi-city prop: [{ averages, label, color? }, ...]
  cities = null,
  // Legacy single/compare props
  averages,
  label = "City",
  compareAverages = null,
  compareLabel = "Compare",
  height = 280,
  className,
  reviewCount = null,
}) {
  // Normalise to a unified cities array
  const cityList = useMemo(() => {
    if (cities) return cities;
    const list = [{ averages, label, color: CHART_COLORS[0] }];
    if (compareAverages) list.push({ averages: compareAverages, label: compareLabel, color: CHART_COLORS[1] });
    return list;
  }, [cities, averages, label, compareAverages, compareLabel]);

  const data = useMemo(() => {
    if (!cityList.length || !cityList[0]?.averages) return null;
    return DIMENSIONS.map(({ key, label: subject }) => {
      const point = { subject };
      cityList.forEach((c, i) => {
        point[String(i)] = c.averages?.[key] ?? null;
      });
      return point;
    });
  }, [cityList]);

  const hasData = data && data.some((d) => d["0"] != null && d["0"] > 0);
  if (!hasData) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-slate-500">
        No rating data yet.
      </div>
    );
  }

  // Replace nulls with 0 so polygons don't crash
  const safeData = data.map((d) => {
    const point = { subject: d.subject };
    cityList.forEach((_, i) => { point[String(i)] = d[String(i)] ?? 0; });
    return point;
  });

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={safeData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke={CHART_GRID_COLOR} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: CHART_TICK_NORMAL }}
          />
          <Tooltip
            formatter={(value, name) => [
              value === 0 ? "N/A" : `${Number(value).toFixed(1)}/10`,
              cityList[Number(name)]?.label ?? name,
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: `1px solid ${CHART_GRID_COLOR}`,
              boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            }}
          />
          {cityList.length > 1 && (
            <Legend
              formatter={(value) => cityList[Number(value)]?.label ?? value}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
          )}
          {cityList.map((city, i) => {
            const color = city.color ?? CHART_COLORS[i] ?? CHART_COLORS[0];
            return (
              <Radar
                key={i}
                name={String(i)}
                dataKey={String(i)}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                dot={false}
              />
            );
          })}
        </RadarChart>
      </ResponsiveContainer>
      {reviewCount != null ? (
        <p className="mt-1 text-center text-xs text-slate-400">
          Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </p>
      ) : null}
    </div>
  );
}
