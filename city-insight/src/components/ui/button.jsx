import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/utils/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-semibold",
    "transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    "outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "active:scale-[0.99]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[hsl(var(--primary))] text-slate-900",
          "shadow-md",
          "hover:bg-[hsl(var(--secondary))] hover:-translate-y-0.5 hover:shadow-lg",
        ].join(" "),

        secondary: [
          "border border-slate-400 bg-white text-slate-700",
          "shadow-sm",
          "hover:bg-slate-50 hover:border-slate-600 hover:text-slate-900",
        ].join(" "),

        danger: [
          "border border-rose-200 bg-white text-rose-700",
          "shadow-sm",
          "hover:bg-rose-50 hover:text-rose-800",
          // "focus-visible:ring-rose-200",
        ].join(" "),
      },

      size: {
        default: "h-9 rounded-lg px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-2xl px-8 has-[>svg]:px-7",
        icon: "h-9 w-9 rounded-lg px-0",
        "icon-sm": "h-8 w-8 rounded-lg px-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
