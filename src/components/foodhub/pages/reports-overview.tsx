"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
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

interface OverviewData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalVendors: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  growthRate: number;
  topStores: { id: string; name: string; revenue: number; orders: number }[];
  orderStatusCounts: { status: string; count: number }[];
}

const FALLBACK: OverviewData = {
  totalRevenue: 824450,
  totalOrders: 32180,
  totalCustomers: 4820,
  totalVendors: 312,
  todayRevenue: 12480,
  weekRevenue: 78420,
  monthRevenue: 312940,
  growthRate: 18.4,
  topStores: [
    { id: "S-01", name: "Bella Italia", revenue: 24860, orders: 1248 },
    { id: "S-02", name: "Sushi Express", revenue: 18420, orders: 894 },
    { id: "S-03", name: "Burger Bros", revenue: 17680, orders: 1102 },
    { id: "S-04", name: "Tandoori House", revenue: 14520, orders: 765 },
    { id: "S-05", name: "Pizza Roma", revenue: 8240, orders: 421 },
  ],
  orderStatusCounts: [
    { status: "Delivered", count: 24120 },
    { status: "Preparing", count: 1820 },
    { status: "On the way", count: 940 },
    { status: "Pending", count: 1240 },
    { status: "Cancelled", count: 4060 },
  ],
};

const KPI_CONFIG = [
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: DollarSign,
    accent: "bg-emerald-50 text-emerald-600",
    format: (n: number) => `$${n.toLocaleString()}`,
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: ShoppingCart,
    accent: "bg-blue-50 text-primary",
    format: (n: number) => n.toLocaleString(),
  },
  {
    key: "totalCustomers",
    label: "Total Customers",
    icon: Users,
    accent: "bg-violet-50 text-violet-600",
    format: (n: number) => n.toLocaleString(),
  },
  {
    key: "totalVendors",
    label: "Total Vendors",
    icon: Store,
    accent: "bg-amber-50 text-amber-600",
    format: (n: number) => n.toLocaleString(),
  },
  {
    key: "todayRevenue",
    label: "Today Revenue",
    icon: DollarSign,
    accent: "bg-emerald-50 text-emerald-600",
    format: (n: number) => `$${n.toLocaleString()}`,
  },
  {
    key: "weekRevenue",
    label: "Week Revenue",
    icon: DollarSign,
    accent: "bg-emerald-50 text-emerald-600",
    format: (n: number) => `$${n.toLocaleString()}`,
  },
  {
    key: "monthRevenue",
    label: "Month Revenue",
    icon: DollarSign,
    accent: "bg-emerald-50 text-emerald-600",
    format: (n: number) => `$${n.toLocaleString()}`,
  },
  {
    key: "growthRate",
    label: "Growth Rate",
    icon: TrendingUp,
    accent: "bg-emerald-50 text-emerald-600",
    format: (n: number) => `${n.toFixed(1)}%`,
  },
] as const;

export default function ReportsOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/reports/overview", { cache: "no-store" });
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
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const positive = data.growthRate >= 0;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#111827]">Reports Overview</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          High-level performance summary across all metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {KPI_CONFIG.map((k, i) => {
          const Icon = k.icon;
          const value = (data as any)[k.key] as number;
          return (
            <motion.div
              key={k.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="rounded-2xl shadow-soft border-[#E5E7EB] py-4">
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.accent}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {k.key === "growthRate" && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-md ${
                          positive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {positive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(data.growthRate).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                      {k.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#111827]">
                      {k.format(value)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl shadow-soft border-[#E5E7EB]">
          <CardHeader className="border-b border-[#F3F4F6]">
            <CardTitle className="text-base text-[#111827]">Top Stores</CardTitle>
            <p className="text-xs text-[#6B7280]">By revenue this month</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                    Store
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">
                    Orders
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">
                    Revenue
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topStores.map((s) => (
                  <TableRow
                    key={s.id}
                    className="border-t border-[#F3F4F6] hover:bg-muted/30"
                  >
                    <TableCell className="py-3 text-sm font-medium text-[#111827]">
                      {s.name}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-right text-[#4B5563]">
                      {s.orders.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 text-sm font-semibold text-emerald-600 text-right">
                      ${s.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft border-[#E5E7EB]">
          <CardHeader className="border-b border-[#F3F4F6]">
            <CardTitle className="text-base text-[#111827]">
              Order Status Counts
            </CardTitle>
            <p className="text-xs text-[#6B7280]">Breakdown by status</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">
                    Count
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">
                    Share
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.orderStatusCounts.map((row, i) => {
                  const total = data.orderStatusCounts.reduce(
                    (s, r) => s + r.count,
                    0,
                  );
                  const pct = total > 0 ? (row.count / total) * 100 : 0;
                  return (
                    <TableRow
                      key={`${row.status}-${i}`}
                      className="border-t border-[#F3F4F6] hover:bg-muted/30"
                    >
                      <TableCell className="py-3 text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="font-medium text-[#111827]">
                            {row.status}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-sm text-right font-semibold text-[#111827]">
                        {row.count.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-right text-[#6B7280]">
                        {pct.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
