import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names, letting a caller's utility win over the default. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
