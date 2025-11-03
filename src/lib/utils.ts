import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toNum = (v: unknown, fallback = 0) =>
  typeof v === "number" && !Number.isNaN(v) ? v : Number(v ?? NaN) || fallback;
