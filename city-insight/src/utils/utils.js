import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/** Merges Tailwind class names, resolving conflicts via tailwind-merge. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
