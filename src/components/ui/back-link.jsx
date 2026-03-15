import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/utils/utils";

export function BackLink({
  to,
  onClick,
  children = "Back",
  className,
  icon = true,
  ...props
}) {
  const Comp = to ? Link : "button";

  return (
    <Comp
      to={to}
      onClick={onClick}
      type={to ? undefined : "button"}
      className={cn(
        "group inline-flex items-center gap-2 px-0 py-1",
        "text-sm font-semibold text-foreground",
        "hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {icon ? (
        <ChevronLeft className="h-4 w-4 shrink-0 text-foreground/70 transition group-hover:text-foreground" />
      ) : null}

      <span
        className={cn(
          "inline-block pb-1",
          // "bg-red-200",
          "bg-[linear-gradient(hsl(var(--primary)),hsl(var(--primary)))]",
          "bg-no-repeat bg-left-bottom",
          "bg-[length:0_2px]",
          "transition-[background-size] duration-200",
          "group-hover:bg-[length:100%_2px]",
        )}
      >
        {children}
      </span>
    </Comp>
  );
}
