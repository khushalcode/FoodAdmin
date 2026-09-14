"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  UtensilsCrossed,
  Receipt,
  Clock,
  Star,
  Wallet,
  HandCoins,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ContentCard, StatusBadge } from "../../shared/list-page";
import KpiCard from "../../kpi-card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usePoll, timeAgo } from "../use-vendor-data";
import type { AuthVendor } from "../../login-page";

interface VendorHomeProps {
  vendor: AuthVendor | null;
  onLastUpdated: (ts: string) => void;
}

interface VendorDashboardData {
  vendor: any;
  kpis: {
    todayRevenue: number;
    last7Revenue: number;
    last30Revenue: number;
    todayOrders: number;
    totalOrders: number;
    avgOrderValue: number;
    pendingOrders: number;
    confirmedOrders: number;
    deliveredOrders: number;
    canceledOrders: number;
    totalProducts: number;
    lowStockCount: number;
    balance: number;
    pendingWithdrawals: number;
    completedWithdrawals: number;
    rating: number;
  };
  charts: {
    weeklySeries: { label: string; value: number; orders: number }[];
  };
  recentOrders: {
    id: string;
    code: string;
    customer: string;
    items: number;
    total: number;
    status: string;
    paymentStatus: string;
    time: string;
  }[];
  topProducts: {
    id: string;
    name: string;
    image: string | null;
    sold: number;
    rating: number;
    price: number;
    stock: number;
    isFeatured: boolean;
  }[];
  lowStock: { id: string; name: string; stock: number; price: number }[];
  recentReviews: {
    id: string;
    customer: string;
    rating: number;
    comment: string | null;
    reply: string | null;
    time: string;
  }[];
}

const tooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 12px",
};

function normalizeStatus(s: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    confirmed: "Preparing",
    preparing: "Preparing",
    handover: "On the way",
    picked_up: "On the way",
    delivered: "Delivered",
    canceled: "Cancelled",
  };
  return map[s] || s.charAt(0).toUpperCase() + s.slice(1);
}

export default function VendorHome({ vendor, onLastUpdated }: VendorHomeProps) {
  const url = vendor ? `/api/vendor/dashboard?vendorId=${vendor.id}` : null;
  const { data, loading } = usePoll<VendorDashboardData>(url, 5000);

  useEffect(() => {
    if (data) {
      onLastUpdated(
        new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      );
    }
  }, [data, onLastUpdated]);

  if (loading && !data) {
    return <VendorHomeSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#6B7280]">No vendor data available.</p>
      </div>
    );
  }

  const k = data.kpis;
  const weekly = data.charts.weeklySeries;

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Today's Revenue" value={k.todayRevenue} format="currency" delta={12.4} icon={DollarSign} accent="blue" />
        <KpiCard label="Today's Orders" value={k.todayOrders} delta={8.2} icon={ShoppingBag} accent="emerald" />
        <KpiCard label="Total Products" value={k.totalProducts} delta={5.6} icon={UtensilsCrossed} accent="violet" />
        <KpiCard label="Avg Order Value" value={k.avgOrderValue} format="currency" delta={-1.4} icon={Receipt} accent="amber" />
      </div>

      {/* Second KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Pending Orders" value={k.pendingOrders} delta={0} icon={Clock} accent="amber" />
        <KpiCard label="Store Rating" value={k.rating} format="number" delta={2.1} icon={Star} accent="emerald" />
        <KpiCard label="Available Balance" value={k.balance} format="currency" delta={4.4} icon={Wallet} accent="blue" />
        <KpiCard label="Pending Withdrawals" value={k.pendingWithdrawals} format="currency" delta={0} icon={HandCoins} accent="violet" />
      </div>

      {/* Weekly revenue chart + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-soft lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-[#111827]">Weekly Revenue</CardTitle>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Last 7 days · Total ${k.last7Revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              <TrendingUp className="w-3 h-3 mr-1" /> Live
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vendorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fill="url(#vendorRev)" isAnimationActive animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-7 gap-1 mt-3">
              {weekly.map((w, i) => (
                <div key={i} className="text-center">
                  <div className="text-[10px] text-[#9CA3AF]">{w.label}</div>
                  <div className="text-xs font-semibold text-[#111827]">{w.orders}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top selling products */}
        <ContentCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#111827]">Top Selling</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Best performers this period</p>
          </div>
          <div className="p-3 space-y-1 max-h-[300px] overflow-y-auto scrollbar-thin">
            {data.topProducts.length === 0 && (
              <p className="text-center text-sm text-[#6B7280] py-8">No sales yet.</p>
            )}
            {data.topProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">{p.name}</p>
                  <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {p.rating.toFixed(1)}
                    <span className="mx-0.5">·</span>
                    {p.sold} sold
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#111827]">${p.price.toFixed(2)}</p>
                  {p.isFeatured && <Badge variant="secondary" className="bg-blue-50 text-primary hover:bg-blue-50 text-[9px] mt-0.5">★ Featured</Badge>}
                </div>
              </motion.div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ContentCard className="lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#111827]">Recent Orders</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">Latest customer orders</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-blue-50 h-8 text-xs">
              View all <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] text-left text-[11px] uppercase tracking-wide text-[#6B7280]">
                  <th className="px-5 py-2.5 font-medium">Order</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium text-right">Total</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#6B7280]">No orders yet.</td>
                  </tr>
                )}
                {data.recentOrders.map((o, i) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-primary">{o.code}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7 rounded-full">
                          <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700 rounded-full">
                            {o.customer.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[#374151]">{o.customer}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-[#111827]">${o.total.toFixed(2)}</td>
                    <td className="px-5 py-3"><StatusBadge status={normalizeStatus(o.status)} /></td>
                    <td className="px-5 py-3 text-right text-xs text-[#9CA3AF] tabular-nums">{timeAgo(o.time)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>

        {/* Low stock alerts */}
        <ContentCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#111827]">Low Stock Alerts</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Restock soon</p>
          </div>
          <div className="p-3 space-y-1 max-h-[300px] overflow-y-auto scrollbar-thin">
            {data.lowStock.length === 0 && (
              <p className="text-center text-sm text-emerald-600 py-8">All products well-stocked ✓</p>
            )}
            {data.lowStock.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">{p.name}</p>
                  <p className="text-xs text-[#6B7280]">${p.price.toFixed(2)}</p>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{p.stock} left</Badge>
              </motion.div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Recent reviews */}
      <ContentCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#111827]">Recent Reviews</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">What customers are saying</p>
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {data.recentReviews.length === 0 && (
            <p className="text-center text-sm text-[#6B7280] py-8">No reviews yet.</p>
          )}
          {data.recentReviews.map((r) => (
            <div key={r.id} className="p-4 flex items-start gap-3 hover:bg-[#F9FAFB] transition-colors">
              <Avatar className="w-9 h-9 rounded-full shrink-0">
                <AvatarFallback className="text-xs bg-amber-100 text-amber-700 rounded-full">
                  {r.customer.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#111827]">{r.customer}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#4B5563] mt-1">{r.comment || "No comment"}</p>
                {r.reply && (
                  <div className="mt-2 p-2 rounded-lg bg-blue-50 text-xs text-primary">
                    <span className="font-medium">Your reply:</span> {r.reply}
                  </div>
                )}
                <p className="text-[10px] text-[#9CA3AF] mt-1">{timeAgo(r.time)}</p>
              </div>
            </div>
          ))}
        </div>
      </ContentCard>
    </div>
  );
}

function VendorHomeSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-[340px] rounded-2xl" />
        <Skeleton className="h-[340px] rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-[300px] rounded-2xl" />
        <Skeleton className="h-[300px] rounded-2xl" />
      </div>
    </div>
  );
}
