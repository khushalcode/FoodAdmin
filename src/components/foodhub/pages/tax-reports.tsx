"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Period = "today" | "7d" | "30d" | "all";

interface TaxData {
  totalTaxCollected: number;
  byDay: { date: string; grossSales: number; taxCollected: number; rate: number }[];
  byStore: {
    storeId: string;
    storeName: string;
    grossSales: number;
    taxCollected: number;
    rate: number;
  }[];
}

const FALLBACK: TaxData = {
  totalTaxCollected: 12984,
  byDay: [
    { date: "2025-11-15", grossSales: 8420, taxCollected: 673.6, rate: 8.0 },
    { date: "2025-11-14", grossSales: 9120, taxCollected: 729.6, rate: 8.0 },
    { date: "2025-11-13", grossSales: 7280, taxCollected: 582.4, rate: 8.0 },
    { date: "2025-11-12", grossSales: 8640, taxCollected: 691.2, rate: 8.0 },
    { date: "2025-11-11", grossSales: 9840, taxCollected: 787.2, rate: 8.0 },
  ],
  byStore: [
    { storeId: "S-01", storeName: "Bella Italia", grossSales: 24860, taxCollected: 1988.8, rate: 8.0 },
    { storeId: "S-02", storeName: "Sushi Express", grossSales: 18420, taxCollected: 1473.6, rate: 8.0 },
    { storeId: "S-03", storeName: "Burger Bros", grossSales: 17680, taxCollected: 1414.4, rate: 8.0 },
    { storeId: "S-04", storeName: "Tandoori House", grossSales: 14520, taxCollected: 1161.6, rate: 8.0 },
    { storeId: "S-05", storeName: "Pizza Roma", grossSales: 8240, taxCollected: 659.2, rate: 8.0 },
  ],
};

const PERIODS: { label: string; value: Period }[] = [
  { label: "Today", value: "today" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "All", value: "all" },
];

export default function TaxReportsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<TaxData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/tax-reports?period=${period}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData({ ...FALLBACK, ...json });
      } catch {
        if (!cancelled) setData(FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Tax Reports</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Sales tax collected, ready for filing
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`h-9 px-3.5 rounded-lg text-xs font-medium border transition-colors ${
                period === p.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F9FAFB]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <Card className="rounded-2xl shadow-soft border-[#E5E7EB] py-4">
          <CardContent className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                Total Tax Collected
              </p>
              <p className="mt-1 text-3xl font-bold text-[#111827]">
                {fmt(data.totalTaxCollected)}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl shadow-soft border-[#E5E7EB]">
          <CardHeader className="border-b border-[#F3F4F6]">
            <CardTitle className="text-base text-[#111827]">By Day</CardTitle>
            <p className="text-xs text-[#6B7280]">Daily tax collected</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Gross</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Rate</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Tax</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byDay.map((row) => (
                  <TableRow key={row.date} className="border-t border-[#F3F4F6] hover:bg-muted/30">
                    <TableCell className="py-3 text-sm font-medium text-[#111827]">{row.date}</TableCell>
                    <TableCell className="py-3 text-sm text-right text-[#4B5563]">{fmt(row.grossSales)}</TableCell>
                    <TableCell className="py-3 text-sm text-right text-[#4B5563]">{row.rate.toFixed(1)}%</TableCell>
                    <TableCell className="py-3 text-sm text-right font-semibold text-rose-600">{fmt(row.taxCollected)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft border-[#E5E7EB]">
          <CardHeader className="border-b border-[#F3F4F6]">
            <CardTitle className="text-base text-[#111827]">By Store</CardTitle>
            <p className="text-xs text-[#6B7280]">Per-store tax collected</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Store</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Gross</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Tax</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byStore.map((row) => (
                  <TableRow key={row.storeId} className="border-t border-[#F3F4F6] hover:bg-muted/30">
                    <TableCell className="py-3 text-sm font-medium text-[#111827]">{row.storeName}</TableCell>
                    <TableCell className="py-3 text-sm text-right text-[#4B5563]">{fmt(row.grossSales)}</TableCell>
                    <TableCell className="py-3 text-sm text-right font-semibold text-rose-600">{fmt(row.taxCollected)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
