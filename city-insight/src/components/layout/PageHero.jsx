import { cn } from "@/utils/utils";
export default function PageHero({
  title,
  description,
  aside,
  asideFooter,
  className = "",
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-400/80 bg-white px-6 py-7 shadow-sm sm:px-8 sm:py-10",
        className,
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="py-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {aside ? (
          <div className="flex items-start gap-4 sm:flex-col sm:items-end sm:text-right">
            <div>
              {aside}
              {asideFooter ? (
                <div className="mt-1 text-xs text-slate-500">{asideFooter}</div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
