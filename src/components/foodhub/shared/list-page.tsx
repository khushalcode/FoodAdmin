"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageHeader({ title, description, actionLabel = "Add New", onAction }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
        {description && <p className="text-sm text-[#6B7280] mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
          onClick={() => onAction?.()}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export
        </Button>
        <Button
          size="sm"
          className="h-9 rounded-lg bg-primary hover:bg-blue-700 text-white shadow-sm"
          onClick={() => onAction?.()}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

export interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  filters?: { label: string; value: string }[];
  activeFilter?: string;
  onFilter?: (v: string) => void;
}

export function FilterBar({ search, onSearch, placeholder = "Search...", filters, activeFilter, onFilter }: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-2.5 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-9 h-10 rounded-lg bg-white border-[#E5E7EB]"
        />
      </div>
      {filters && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-[#9CA3AF] shrink-0 mr-1" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilter?.(f.value)}
              className={`shrink-0 h-10 px-3.5 rounded-lg text-xs font-medium border transition-colors ${
                activeFilter === f.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F9FAFB]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export interface StatusBadgeProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-gray-100 text-gray-600 border-gray-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Preparing: "bg-blue-50 text-blue-700 border-blue-200",
  "On the way": "bg-violet-50 text-violet-700 border-violet-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Busy: "bg-amber-50 text-amber-700 border-amber-200",
  Offline: "bg-gray-100 text-gray-600 border-gray-200",
  "On Delivery": "bg-blue-50 text-blue-700 border-blue-200",
  Online: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Unverified: "bg-gray-100 text-gray-600 border-gray-200",
  Running: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Expired: "bg-red-50 text-red-700 border-red-200",
  Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cls = STATUS_COLORS[status] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function useFakeLoading(delayMs = 550) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return loading;
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-44 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export interface ContentCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ContentCard({ children, className = "", delay = 0 }: ContentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={`bg-white rounded-2xl border border-[#E5E7EB] shadow-soft ${className}`}
    >
      {children}
    </motion.div>
  );
}

export interface TableActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TableActionButtons({ onView, onEdit, onDelete }: TableActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      {onView && (
        <button
          onClick={onView}
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#6B7280] hover:bg-blue-50 hover:text-primary transition-colors"
          title="View"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#6B7280] hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          title="Edit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
          </svg>
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      )}
    </div>
  );
}

export { Card, Button, Input, Badge };
