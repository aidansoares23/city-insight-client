import * as React from "react";
import { cn } from "@/utils/utils";

/**
 * Reusable section wrapper - contains various chunks of content per page
 */
export default function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
  showHeader = true,
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-400 bg-white px-5 py-4",
        className,
      )}
    >
      {showHeader ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {Icon ? <Icon className="h-5 w-5 text-slate-500" /> : null}
              <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900">
                {title}
              </h2>
            </div>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          {action ? (
            <div className="sm:shrink-0">
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {action}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={cn(showHeader ? "mt-3" : "", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
