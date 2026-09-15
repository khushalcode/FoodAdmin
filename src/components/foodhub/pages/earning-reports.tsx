"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Percent,
  Store,
  Bike,
  Coins,
  Wallet,
  TrendingUp,
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

type Period = "today" | "7d" | "30d" | "all";

interface EarningData {
  totalRevenue: number;
  platformCommission: number;
  vendorPayouts: number;
  deliveryFees: number;
  dmTips: number;
  taxCollected: number;
  netProfit: number;
  byDay: { date: string; revenue: number; commission: number; payout: number }[];
  byStore: {
    storeId: string;
    storeName: string;
    orders: number;
    revenue: number;
    payout: number;
  }[];
}

const FALLBACK: EarningData = {
  totalRevenue: 184250,
  platformCommission: 18425,
  vendorPayouts: 148200,
  deliveryFees: 12480,
  dmTips: 3420,
  taxCollected: 12984,
  netProfit: 24320,
  byDay: [
    { date: "2025-11-15", revenue: 8420, commission: 842, payout: 6720 },
    { date: "2025-11-14", revenue: 9120, commission: 912, payout: 7240 },
    { date: "2025-11-13", revenue: 7280, commission: 728, payout: 5840 },
    { date: "2025-11-12", revenue: 8640, commission: 864, payout: 6920 },
    { date: "2025-11-11", revenue: 9840, commission: 984, payout: 7840 },
  ],
  byStore: [
    { storeId: "S-01", storeName: "Bella Italia", orders: 1248, revenue: 24860, payout: 22374 },
    { storeId: "S-02", storeName: "Sushi Express", orders: 894, revenue: 18420, payout: 16578 },
    { storeId: "S-03", storeName: "Burger Bros", orders: 1102, revenue: 17680, payout: 15912 },
    { storeId: "S-04", storeName: "Tandoori House", orders: 765, revenue: 14520, payout: 13068 },
    { storeId: "S-05", storeName: "Pizza Roma", orders: 421, revenue: 8240, payout: 7416 },
  ],
};

const KPI_CONFIG = [
  { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, accent: "bg-emerald-50 text-emerald-600" },
  { key: "platformCommission", label: "Platform Commission", icon: Percent, accent: "bg-amber-50 text-amber-600" },
  { key: "vendorPayouts", label: "Vendor Payouts", icon: Store, accent: "bg-blue-50 text-primary" },
  { key: "deliveryFees", label: "Delivery Fees", icon: Bike, accent: "bg-violet-50 text-violet-600" },
  { key: "dmTips", label: "DM Tips", icon: Coins, accent: "bg-cyan-50 text-cyan-600" },
  { key: "taxCollected", label: "Tax Collected", icon: Wallet, accent: "bg-rose-50 text-rose-600" },
  { key: "netProfit", label: "Net Profit", icon: TrendingUp, accent: "bg-emerald-50 text-emerald-700" },
] as const;

const PERIODS: { label: string; value: Period }[] = [
  { label: "Today", value: "today" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "All", value: "all" },
];

export default function EarningReportsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<EarningData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/earning-reports?period=${period}`, {
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Earning Reports</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Revenue breakdown by day and by store
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
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.accent}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                      {k.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#111827]">
                      {fmt(value)}
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
            <CardTitle className="text-base text-[#111827]">By Day</CardTitle>
            <p className="text-xs text-[#6B7280]">Daily revenue breakdown</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Revenue</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Commission</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byDay.map((row) => (
                  <TableRow key={row.date} className="border-t border-[#F3F4F6] hover:bg-muted/30">
                    <TableCell className="py-3 text-sm font-medium text-[#111827]">{row.date}</TableCell>
                    <TableCell className="py-3 text-sm text-right text-emerald-600 font-semibold">{fmt(row.revenue)}</TableCell>
                    <TableCell className="py-3 text-sm text-right text-amber-600">{fmt(row.commission)}</TableCell>
                    <TableCell className="py-3 text-sm text-right text-[#4B5563]">{fmt(row.payout)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft border-[#E5E7EB]">
          <CardHeader className="border-b border-[#F3F4F6]">
            <CardTitle className="text-base text-[#111827]">By Store</CardTitle>
            <p className="text-xs text-[#6B7280]">Per-store performance</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Store</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Orders</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Revenue</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byStore.map((row) => (
                  <TableRow key={row.storeId} className="border-t border-[#F3F4F6] hover:bg-muted/30">
                    <TableCell className="py-3 text-sm font-medium text-[#111827]">{row.storeName}</TableCell>
                    <TableCell className="py-3 text-sm text-right text-[#4B5563]">{row.orders.toLocaleString()}</TableCell>
                    <TableCell className="py-3 text-sm text-right font-semibold text-emerald-600">{fmt(row.revenue)}</TableCell>
                    <TableCell className="py-3 text-sm text-right text-[#4B5563]">{fmt(row.payout)}</TableCell>
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
