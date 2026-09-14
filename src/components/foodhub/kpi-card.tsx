"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "./use-live-data";

export interface KpiCardProps {
  label: string;
  value: number;
  format?: "currency" | "number";
  delta: number; // percentage change, e.g. +12.4 or -3.1
  icon: LucideIcon;
  accent?: "blue" | "emerald" | "amber" | "violet";
  flashing?: boolean;
}

const ACCENT_BG: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  blue: "bg-[#DBEAFE] text-primary",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  violet: "bg-violet-100 text-violet-600",
};

function formatValue(value: number, format: "currency" | "number"): string {
  if (format === "currency") {
    if (value >= 1000) {
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `$${value.toFixed(2)}`;
  }
  return Math.round(value).toLocaleString();
}

export default function KpiCard({
  label,
  value,
  format = "number",
  delta,
  icon: Icon,
  accent = "blue",
  flashing,
}: KpiCardProps) {
  const animated = useCountUp(value, 1400);
  const positive = delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className={cn(
        "bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-soft transition-shadow hover:shadow-md",
        flashing && "live-flash",
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", ACCENT_BG[accent])}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-md",
            positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
          )}
        >
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(delta).toFixed(1)}%
        </div>
      </div>
      <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#111827] tabular-nums">
        {formatValue(animated, format)}
      </p>
      <p className="mt-1.5 text-xs text-[#9CA3AF]">vs last 30 days</p>
    </motion.div>
  );
}
