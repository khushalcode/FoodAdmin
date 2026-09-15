"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Bike, TrendingUp } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Period = "today" | "7d" | "30d" | "all";

interface DmEarningData {
  totalEarnings: number;
  totalDeliveries: number;
  avgPerDelivery: number;
  breakdown: {
    deliveryManId: string;
    name: string;
    deliveries: number;
    earnings: number;
    rating: number;
  }[];
}

const FALLBACK: DmEarningData = {
  totalEarnings: 27580,
  totalDeliveries: 1950,
  avgPerDelivery: 14.14,
  breakdown: [
    { deliveryManId: "DM-04", name: "Maria Santos", deliveries: 412, earnings: 5280, rating: 4.9 },
    { deliveryManId: "DM-07", name: "Robert Chen", deliveries: 312, earnings: 4480, rating: 4.7 },
    { deliveryManId: "DM-02", name: "Aisha Khan", deliveries: 312, earnings: 4120, rating: 4.8 },
    { deliveryManId: "DM-01", name: "Carlos Rivera", deliveries: 248, earnings: 3840, rating: 4.9 },
    { deliveryManId: "DM-06", name: "Fatima Ali", deliveries: 224, earnings: 3240, rating: 4.8 },
    { deliveryManId: "DM-03", name: "David Park", deliveries: 188, earnings: 2840, rating: 4.7 },
    { deliveryManId: "DM-08", name: "Sara Mohamed", deliveries: 158, earnings: 2340, rating: 4.5 },
    { deliveryManId: "DM-05", name: "James Wilson", deliveries: 96, earnings: 1420, rating: 4.6 },
  ],
};

const PERIODS: { label: string; value: Period }[] = [
  { label: "Today", value: "today" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "All", value: "all" },
];

const COLORS = [
  "from-orange-500 to-red-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-indigo-500 to-violet-600",
];

const KPI_CONFIG = [
  { key: "totalEarnings", label: "Total DM Earnings", icon: DollarSign, accent: "bg-emerald-50 text-emerald-600" },
  { key: "totalDeliveries", label: "Total Deliveries", icon: Bike, accent: "bg-blue-50 text-primary" },
  { key: "avgPerDelivery", label: "Avg per Delivery", icon: TrendingUp, accent: "bg-violet-50 text-violet-600" },
] as const;

export default function DmEarningReportsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<DmEarningData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/dm-earning-reports?period=${period}`, {
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">DM Earning Reports</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Per-delivery-boy performance & earnings
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {KPI_CONFIG.map((k, i) => {
          const Icon = k.icon;
          const value = (data as any)[k.key] as number;
          return (
            <motion.div
              key={k.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="rounded-2xl shadow-soft border-[#E5E7EB] py-4">
                <CardContent className="space-y-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                      {k.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#111827]">
                      {k.key === "avgPerDelivery" ? `$${value.toFixed(2)}` : k.key === "totalDeliveries" ? value.toLocaleString() : fmt(value)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="rounded-2xl shadow-soft border-[#E5E7EB]">
        <CardHeader className="border-b border-[#F3F4F6]">
          <CardTitle className="text-base text-[#111827]">Breakdown by DM</CardTitle>
          <p className="text-xs text-[#6B7280]">
            {data.breakdown.length} delivery personnel · period: {period}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Driver</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Deliveries</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Rating</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.breakdown.map((r, i) => (
                <TableRow key={r.deliveryManId} className="border-t border-[#F3F4F6] hover:bg-muted/30">
                  <TableCell className="py-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8 rounded-full">
                        <AvatarFallback className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full font-semibold`}>
                          {r.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#111827]">{r.name}</p>
                        <p className="text-xs text-[#9CA3AF]">{r.deliveryManId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-right font-semibold text-[#111827]">{r.deliveries}</TableCell>
                  <TableCell className="py-3 text-sm text-right">
                    <span className="inline-flex items-center gap-0.5 text-amber-600">
                      <span className="text-amber-400">★</span>
                      {r.rating}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-right font-bold text-emerald-600">{fmt(r.earnings)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
