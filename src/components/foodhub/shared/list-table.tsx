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
  useFakeLoading,
  ListSkeleton,
  TableActionButtons,
  ContentCard,
} from "./list-page";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render?: (row: T, index: number) => ReactNode;
}

export interface ListTableProps<T extends { id: string | number }> {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  statusKey?: keyof T;
  filters?: { label: string; value: string; match: (row: T) => boolean }[];
  actionLabel?: string;
  onAction?: () => void;
  emptyMessage?: string;
}

export function ListTable<T extends { id: string | number }>({
  title,
  description,
  data,
  columns,
  searchKeys,
  statusKey,
  filters,
  actionLabel,
  onAction,
  emptyMessage = "No records found.",
}: ListTableProps<T>) {
  const loading = useFakeLoading();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(filters?.[0]?.value || "all");

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
      <PageHeader
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
      />

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
          <div className="p-12 text-center text-sm text-[#6B7280]">{emptyMessage}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB] border-[#F3F4F6]">
                {columns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={`text-[11px] uppercase tracking-wide font-semibold text-[#6B7280] ${
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
                  className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
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
                          : <span className="text-[#374151]">{String(row[c.key as keyof T] ?? "")}</span>}
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

export { TableActionButtons };
