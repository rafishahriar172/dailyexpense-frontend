import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind + conditional classNames
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}
