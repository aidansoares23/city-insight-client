import { useState, useMemo } from "react";
import { fmtMoney } from "@/lib/format";
import { NATIONAL_AVG } from "@/lib/cost-estimates";

const COST_ROWS = [
  { key: "rent",           label: "Rent" },
  { key: "groceries",      label: "Groceries" },
  { key: "utilities",      label: "Utilities" },
  { key: "transportation", label: "Transportation" },
  { key: "healthcare",     label: "Healthcare" },
  { key: "misc",           label: "Miscellaneous" },
];

/**
 * Estimates monthly costs for a city using the rent-multiplier method:
 * each non-rent category scales proportionally to how the city's rent
 * compares to the national average.
 */
function estimateMonthlyCosts(medianRent) {
  if (medianRent == null) return null;
  const multiplier = medianRent / NATIONAL_AVG.rent;
  const costs = {};
  for (const { key } of COST_ROWS) {
    costs[key] = key === "rent" ? medianRent : Math.round(NATIONAL_AVG[key] * multiplier);
  }
  costs.total = Object.values(costs).reduce((s, v) => s + v, 0);
  return costs;
}

export default function CostCalculator({ cities }) {
  const citiesWithRent = cities.filter((c) => c.data?.metrics?.medianRent != null);

  const [salary, setSalary] = useState(70000);
  const [originIdx, setOriginIdx] = useState(0);

  const costsByCityIdx = useMemo(
    () => cities.map((c) => estimateMonthlyCosts(c.data?.metrics?.medianRent ?? null)),
    [cities],
  );

  const originCosts = costsByCityIdx[originIdx];

  if (citiesWithRent.length < 2) {
    return (
      <p className="text-sm text-slate-500 italic">
        Rent data is required for at least two cities to calculate moving costs.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Your current salary</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={salary}
              onChange={(e) => setSalary(Math.max(0, parseInt(e.target.value) || 0))}
              className="rounded-lg border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm text-slate-900 w-36 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Currently living in</label>
          <select
            value={originIdx}
            onChange={(e) => setOriginIdx(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            {cities.map((c, i) => (
              <option key={c.slug} value={i} disabled={costsByCityIdx[i] == null}>
                {c.data?.city?.name ?? c.slug}{costsByCityIdx[i] == null ? " (no rent data)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cost breakdown table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Monthly expense
              </th>
              {cities.map((c) => (
                <th key={c.slug} className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {c.data?.city?.name ?? c.slug}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COST_ROWS.map(({ key, label }) => (
              <tr key={key} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 text-slate-600">{label}</td>
                {cities.map((_, i) => {
                  const costs = costsByCityIdx[i];
                  return (
                    <td key={i} className="px-4 py-2.5 text-right tabular-nums text-slate-900">
                      {costs ? fmtMoney(costs[key]) : "N/A"}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
              <td className="px-4 py-2.5 text-slate-900">Total / month</td>
              {cities.map((_, i) => {
                const costs = costsByCityIdx[i];
                return (
                  <td key={i} className="px-4 py-2.5 text-right tabular-nums text-slate-900">
                    {costs ? fmtMoney(costs.total) : "N/A"}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Equivalent salary row */}
      {originCosts && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-3 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary-foreground))]">Equivalent salary to maintain your lifestyle</p>
          <div className="flex flex-wrap gap-4">
            {cities.map((c, i) => {
              if (i === originIdx || !costsByCityIdx[i]) return null;
              const equiv = Math.round((salary * costsByCityIdx[i].total) / originCosts.total);
              const diff = equiv - salary;
              const sign = diff >= 0 ? "+" : "";
              return (
                <div key={c.slug}>
                  <p className="text-sm font-semibold text-slate-900">{c.data?.city?.name ?? c.slug}</p>
                  <p className="text-lg font-bold text-[hsl(var(--foreground))] tabular-nums">{fmtMoney(equiv)}</p>
                  <p className={`text-xs tabular-nums ${diff > 0 ? "text-[hsl(var(--score-bad))]" : "text-[hsl(var(--score-good))]"}`}>
                    {sign}{fmtMoney(Math.abs(diff))} vs. your current salary
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Estimates based on median rent ratios and 2024 national averages. Actual costs vary.
      </p>
    </div>
  );
}
