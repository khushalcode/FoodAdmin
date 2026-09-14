"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Wallet, HandCoins, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ContentCard } from "../../shared/list-page";
import KpiCard from "../../kpi-card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usePoll, useFetchOnce, timeAgo } from "../use-vendor-data";
import type { AuthVendor } from "../../login-page";

interface VendorEarningsProps {
  vendor: AuthVendor | null;
}

interface VendorDashboardData {
  kpis: {
    todayRevenue: number;
    last7Revenue: number;
    last30Revenue: number;
    todayOrders: number;
    totalOrders: number;
    avgOrderValue: number;
    completedWithdrawals: number;
    pendingWithdrawals: number;
    balance: number;
  };
  charts: {
    weeklySeries: { label: string; value: number; orders: number }[];
  };
}

interface Withdrawal {
  id: string;
  amount: number;
  method: string;
  status: string;
  note: string | null;
  time: string;
}

const tooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 12px",
};

const METHOD_BADGE: Record<string, string> = {
  bank: "bg-blue-50 text-blue-700 border-blue-200",
  paypal: "bg-indigo-50 text-indigo-700 border-indigo-200",
  wallet: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function VendorEarnings({ vendor }: VendorEarningsProps) {
  const dashUrl = vendor ? `/api/vendor/dashboard?vendorId=${vendor.id}` : null;
  const { data: dash, loading } = usePoll<VendorDashboardData>(dashUrl, 5000);
  const withdrawalsUrl = vendor ? `/api/vendor/withdrawals?vendorId=${vendor.id}` : null;
  const { data: withdrawals } = useFetchOnce<Withdrawal[]>(withdrawalsUrl);

  if (loading && !dash) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[340px] rounded-2xl" />
      </div>
    );
  }

  if (!dash) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#6B7280]">No earnings data available.</p>
      </div>
    );
  }

  const k = dash.kpis;
  const weekly = dash.charts.weeklySeries;
  const recentWithdrawals = (withdrawals || []).slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Today's Revenue" value={k.todayRevenue} format="currency" delta={12.4} icon={DollarSign} accent="blue" />
        <KpiCard label="Last 7 Days" value={k.last7Revenue} format="currency" delta={8.2} icon={TrendingUp} accent="emerald" />
        <KpiCard label="Available Balance" value={k.balance} format="currency" delta={4.4} icon={Wallet} accent="violet" />
        <KpiCard label="Total Withdrawn" value={k.completedWithdrawals} format="currency" delta={2.1} icon={HandCoins} accent="amber" />
      </div>

      <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-soft">
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[#111827]">Revenue (Last 7 days)</CardTitle>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Total ${k.last7Revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} · Avg ${k.avgOrderValue.toFixed(2)}/order
            </p>
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            <TrendingUp className="w-3 h-3 mr-1" /> Live
          </Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} tickLine={false} axisLine={false} width={50} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} fill="url(#earnGrad)" isAnimationActive animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent withdrawals */}
      <ContentCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#111827]">Recent Withdrawals</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Your payout history</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-blue-50 h-8 text-xs">
            View all <ArrowUpRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        {recentWithdrawals.length === 0 ? (
          <div className="p-12 text-center">
            <HandCoins className="w-10 h-10 mx-auto text-[#9CA3AF] mb-3" />
            <p className="text-sm text-[#6B7280]">No withdrawal requests yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] text-left text-[11px] uppercase tracking-wide text-[#6B7280]">
                  <th className="px-5 py-2.5 font-medium">Amount</th>
                  <th className="px-5 py-2.5 font-medium">Method</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Note</th>
                  <th className="px-5 py-2.5 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentWithdrawals.map((w, i) => (
                  <motion.tr
                    key={w.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="px-5 py-3 font-semibold text-[#111827]">${w.amount.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border capitalize ${METHOD_BADGE[w.method] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                        {w.method}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border capitalize ${STATUS_BADGE[w.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#4B5563] max-w-[200px] truncate">{w.note || "—"}</td>
                    <td className="px-5 py-3 text-right text-xs text-[#9CA3AF]">{timeAgo(w.time)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>

      {/* Order stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ContentCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-[#111827]">{k.totalOrders}</p>
            </div>
          </div>
        </ContentCard>
        <ContentCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Last 30 Days</p>
              <p className="text-2xl font-bold text-[#111827]">${k.last30Revenue.toFixed(0)}</p>
            </div>
          </div>
        </ContentCard>
        <ContentCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-[#111827]">${k.pendingWithdrawals.toFixed(2)}</p>
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
