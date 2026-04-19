import { cn } from "@/utils/utils";

/**
 * Segmented number-button selector — replaces the native range slider for
 * better touch/click usability on small integer ranges.
 *
 * Props:
 *   label        – primary label text
 *   description  – optional secondary description (shown below label)
 *   value        – current numeric value
 *   onChange     – called with the new numeric value
 *   min          – minimum selectable value (default 0)
 *   max          – maximum selectable value (default 10)
 *   minLabel     – left-end hint text (e.g. "Poor", "Not important")
 *   maxLabel     – right-end hint text (e.g. "Excellent", "Very important")
 */
export function RatingSlider({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 10,
  minLabel,
  maxLabel,
}) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1 sm:flex">
        {steps.map((n) => {
          const selected = n === value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-label={`${label}: ${n}`}
              aria-pressed={selected}
              className={cn(
                "rounded-lg py-1.5 text-sm font-semibold transition-colors sm:flex-1",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[hsl(var(--primary))]",
                selected
                  ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>

      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
