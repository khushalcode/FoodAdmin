"use client";

import { type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageHeader,
  FilterBar,
  StatusBadge,
  ListSkeleton,
  TableActionButtons,
  ContentCard,
} from "./list-page";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render?: (row: T, index: number) => ReactNode;
}

export interface CrudListTableProps<T extends { id: string | number }> {
  title: string;
  description?: string;
  items: T[] | null;
  loading: boolean;
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  statusKey?: keyof T;
  filters?: { label: string; value: string; match: (row: T) => boolean }[];
  actionLabel?: string;
  onAction?: () => void;
  emptyMessage?: string;
  onRefresh?: () => void;
  realtimeStatus?: "connecting" | "subscribed" | "closed" | "error";
}

/**
 * CrudListTable — drop-in replacement for ListTable that takes live data + loading state.
 *
 * Differences from ListTable:
 *   - Takes `items` + `loading` from the calling hook (no internal useFakeLoading)
 *   - Has a Refresh button that calls `onRefresh`
 *   - Shows realtime status badge (if provided)
 *   - Action buttons trigger real CRUD callbacks (caller wires them up)
 */
export function CrudListTable<T extends { id: string | number }>({
  title,
  description,
  items,
  loading,
  columns,
  searchKeys,
  statusKey,
  filters,
  actionLabel,
  onAction,
  emptyMessage = "No records found.",
  onRefresh,
  realtimeStatus,
}: CrudListTableProps<T>) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(filters?.[0]?.value || "all");

  const data = items || [];
  const filtered = data.filter((row) => {
    const matchesSearch =
      !search ||
      searchKeys.some((k) =>
        String(row[k] ?? "").toLowerCase().includes(search.toLowerCase()),
      );
    const matchesFilter =
      !filters ||
      activeFilter === "all" ||
      filters.find((f) => f.value === activeFilter)?.match(row);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span>{data.length} records</span>
            {realtimeStatus && (
              <span className={realtimeStatus === "subscribed" ? "text-emerald-600 font-medium" : "text-amber-600"}>
                · realtime: {realtimeStatus}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh
            </Button>
          )}
          {actionLabel && onAction && (
            <Button
              size="sm"
              onClick={onAction}
              className="h-9 rounded-lg bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90 text-white shadow-sm"
            >
              + {actionLabel}
            </Button>
          )}
        </div>
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder={`Search ${title.toLowerCase()}...`}
        filters={filters?.map((f) => ({ label: f.label, value: f.value }))}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
      />

      <ContentCard className="overflow-hidden">
        {loading ? (
          <div className="p-5">
            <ListSkeleton rows={6} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">{emptyMessage}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {columns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={`text-[11px] uppercase tracking-wide font-semibold text-muted-foreground ${
                      c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""
                    }`}
                  >
                    {c.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  {columns.map((c) => (
                    <TableCell
                      key={c.key}
                      className={`py-3 text-sm ${
                        c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""
                      }`}
                    >
                      {c.render
                        ? c.render(row, i)
                        : statusKey && c.key === String(statusKey)
                          ? <StatusBadge status={String(row[c.key as keyof T])} />
                          : <span className="text-foreground">{String(row[c.key as keyof T] ?? "")}</span>}
                    </TableCell>
                  ))}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </ContentCard>
    </div>
  );
}
