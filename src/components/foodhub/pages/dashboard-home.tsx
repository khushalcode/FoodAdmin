"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Receipt,
  ArrowUpRight,
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  Store,
  Package,
  AlertTriangle,
  Star,
  Activity,
  Bell,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import KpiCard from "../kpi-card";
import { ContentCard, StatusBadge } from "../shared/list-page";
import { useCountUp } from "../use-live-data";

interface DashboardHomeProps {
  onLastUpdated: (ts: string) => void;
}

interface DashboardData {
  kpis: {
    totalRevenue: number;
    todayRevenue: number;
    totalOrders: number;
    todayOrders: number;
    totalCustomers: number;
    totalVendors: number;
    totalProducts: number;
    totalCategories: number;
    totalDeliveryMen: number;
    avgOrderValue: number;
    last7Revenue: number;
    pendingOrders: number;
    confirmedOrders: number;
    deliveredOrders: number;
    canceledOrders: number;
    conversionRate: number;
  };
  charts: {
    hourlySeries: { label: string; value: number }[];
    weeklySeries: { label: string; value: number }[];
    statusBreakdown: { name: string; value: number; color: string }[];
  };
  recentOrders: {
    id: string;
    code: string;
    customer: string;
    vendor: string;
    total: number;
    status: string;
    paymentStatus: string;
    items: number;
    time: string;
  }[];
  topProducts: {
    id: string;
    name: string;
    image: string | null;
    sold: number;
    rating: number;
    price: number;
    vendor: string;
    stock: number;
  }[];
  lowStock: { id: string; name: string; stock: number; vendor: string }[];
  newCustomers: { id: string; name: string; email: string; joinedAt: string }[];
  recentActivities: { id: string; message: string; type: string; time: string }[];
}

const SUGGESTED_PROMPTS = [
  "What's our top-selling dish today?",
  "Show me yesterday's revenue breakdown",
  "Which restaurants have low ratings?",
  "Forecast next week's orders",
];

const ACTIVITY_ICON: Record<string, string> = {
  order: "🛒",
  user: "👤",
  product: "📦",
  payment: "💰",
  info: "ℹ️",
};

const ACTIVITY_COLOR: Record<string, string> = {
  order: "bg-blue-100 text-blue-700",
  user: "bg-violet-100 text-violet-700",
  product: "bg-emerald-100 text-emerald-700",
  payment: "bg-amber-100 text-amber-700",
  info: "bg-gray-100 text-gray-700",
};

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

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

const tooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 12px",
};

const SKELETON_KPI: DashboardData["kpis"] = {
    totalRevenue: 0, todayRevenue: 0, totalOrders: 0, todayOrders: 0,
    totalCustomers: 0, totalVendors: 0, totalProducts: 0, totalCategories: 0,
    totalDeliveryMen: 0, avgOrderValue: 0, last7Revenue: 0,
    pendingOrders: 0, confirmedOrders: 0, deliveredOrders: 0, canceledOrders: 0,
    conversionRate: 0,
  };

export default function DashboardHome({ onLastUpdated }: DashboardHomeProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const prevKpiRef = useRef<DashboardData["kpis"] | null>(null);

  // AI chat state
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Hi Alex! 👋 I'm your FoodHub AI assistant. Your dashboard is looking great today — sales are up 12.4% vs last week. Ask me anything about your business.",
    },
  ]);
  const [input, setInput] = useState("");

  // Poll every 5 seconds
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/stats", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: DashboardData = await res.json();
        if (cancelled) return;
        // Detect KPI changes for live-flash effect
        if (prevKpiRef.current) {
          const prev = prevKpiRef.current;
          if (prev.totalRevenue !== json.kpis.totalRevenue) {
            setFlashKey("sales");
            setTimeout(() => setFlashKey(null), 600);
          } else if (prev.totalOrders !== json.kpis.totalOrders) {
            setFlashKey("orders");
            setTimeout(() => setFlashKey(null), 600);
          } else if (prev.totalCustomers !== json.kpis.totalCustomers) {
            setFlashKey("customers");
            setTimeout(() => setFlashKey(null), 600);
          }
        }
        prevKpiRef.current = json.kpis;
        setData(json);
        setError(null);
        setLoading(false);
        onLastUpdated(
          new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        );
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Fetch failed");
          setLoading(false);
        }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [onLastUpdated]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: "user" as const, text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      const replies = [
        "Great question! Based on today's data, your top performer is Margherita Pizza with 1,248 units sold. Revenue from this dish is up 12.4% week-over-week.",
        "Yesterday's total revenue was $4,820 across 184 orders. Pizza category led with 38% share, followed by Burgers at 24%.",
        "I noticed 3 restaurants with ratings below 4.0 — Street Tacos (3.7), Quick Bites (3.8), and Corner Cafe (3.9). Want me to draft improvement suggestions?",
        "Based on the last 4 weeks trend, I forecast 2,180 orders next week (+7.2%). Consider staffing up for Friday's expected 420-order spike.",
      ];
      setMessages((m) => [...m, { role: "ai", text: replies[Math.floor(Math.random() * replies.length)] }]);
    }, 700);
  };

  const k = data?.kpis;
  const useKpi: DashboardData["kpis"] = k || SKELETON_KPI;

  return (
    <div className="space-y-5">
      {/* Quick stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickStatPill
          label="Today's Revenue"
          value={k ? k.todayRevenue : 0}
          format="currency"
          icon={DollarSign}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <QuickStatPill
          label="Today's Orders"
          value={k ? k.todayOrders : 0}
          icon={ShoppingBag}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <QuickStatPill
          label="Conversion"
          value={k ? k.conversionRate : 0}
          format="percent"
          icon={TrendingUp}
          color="text-violet-600"
          bg="bg-violet-50"
        />
        <QuickStatPill
          label="Avg Order Value"
          value={k ? k.avgOrderValue : 0}
          format="currency"
          icon={Receipt}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value={useKpi.totalRevenue || k?.totalRevenue || 0}
          format="currency"
          delta={12.4}
          icon={DollarSign}
          accent="blue"
          flashing={flashKey === "sales"}
        />
        <KpiCard
          label="Total Orders"
          value={useKpi.totalOrders || k?.totalOrders || 0}
          delta={8.2}
          icon={ShoppingBag}
          accent="emerald"
          flashing={flashKey === "orders"}
        />
        <KpiCard
          label="Active Customers"
          value={useKpi.totalCustomers || k?.totalCustomers || 0}
          delta={5.6}
          icon={Users}
          accent="violet"
          flashing={flashKey === "customers"}
        />
        <KpiCard
          label="Avg Order Value"
          value={useKpi.avgOrderValue || k?.avgOrderValue || 0}
          format="currency"
          delta={-1.4}
          icon={Receipt}
          accent="amber"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-soft lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-[#111827]">Hourly Revenue</CardTitle>
              <p className="text-xs text-[#6B7280] mt-0.5">Revenue by hour — last 24h (live)</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              <TrendingUp className="w-3 h-3 mr-1" /> Live
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.charts.hourlySeries || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={50}
                  />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Revenue"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fill="url(#salesGrad)"
                    isAnimationActive
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order status donut */}
        <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-soft h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#111827]">Order Status</CardTitle>
            <p className="text-xs text-[#6B7280] mt-0.5">Live breakdown of all orders</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.charts.statusBreakdown || []}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={2}
                    isAnimationActive
                    animationDuration={900}
                  >
                    {(data?.charts.statusBreakdown || []).map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-[#111827]">{k?.totalOrders || 0}</span>
                <span className="text-xs text-[#6B7280]">total orders</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(data?.charts.statusBreakdown || []).map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-[#4B5563]">{s.name}</span>
                  </div>
                  <span className="font-semibold text-[#111827]">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly bar chart + Repeat customer gauge placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-soft lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#111827]">Weekly Revenue</CardTitle>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Last 7 days · Total ${k?.last7Revenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.charts.weeklySeries || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F9FAFB" }} />
                  <Bar dataKey="value" name="Revenue" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800}>
                    {(data?.charts.weeklySeries || []).map((entry, i) => (
                      <Cell key={i} fill={i === (data?.charts.weeklySeries.length || 0) - 1 ? "#3B82F6" : "#93C5FD"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders mini-card + Conversion */}
        <div className="space-y-4">
          <ContentCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Pending Orders</p>
                <p className="mt-1 text-3xl font-bold text-amber-600">{k?.pendingOrders ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-3 text-primary hover:bg-blue-50 h-8 text-xs w-full">
              View all orders <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </ContentCard>

          <ContentCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Conversion Rate</p>
                <p className="mt-1 text-3xl font-bold text-emerald-600">{(k?.conversionRate || 0).toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="mt-3 text-xs text-[#9CA3AF]">
              {k?.deliveredOrders ?? 0} delivered / {k?.totalOrders ?? 0} total
            </p>
          </ContentCard>
        </div>
      </div>

      {/* Second row: low stock + top selling + new customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Low stock alerts */}
        <ContentCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111827]">Low Stock</h3>
                <p className="text-xs text-[#6B7280]">Products below 25 units</p>
              </div>
            </div>
          </div>
          <div className="p-3 space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin">
            {loading ? (
              <p className="text-center text-sm text-[#9CA3AF] py-6">Loading...</p>
            ) : (data?.lowStock.length || 0) === 0 ? (
              <p className="text-center text-sm text-emerald-600 py-8">All products well-stocked ✓</p>
            ) : (
              data?.lowStock.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{p.name}</p>
                    <p className="text-xs text-[#6B7280] truncate">{p.vendor}</p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{p.stock} left</Badge>
                </motion.div>
              ))
            )}
          </div>
        </ContentCard>

        {/* Top selling dishes */}
        <ContentCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111827]">Top Selling Dishes</h3>
                <p className="text-xs text-[#6B7280]">Best performers this period</p>
              </div>
            </div>
          </div>
          <div className="p-3 space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin">
            {loading ? (
              <p className="text-center text-sm text-[#9CA3AF] py-6">Loading...</p>
            ) : (data?.topProducts.length || 0) === 0 ? (
              <p className="text-center text-sm text-[#6B7280] py-8">No sales data yet.</p>
            ) : (
              data?.topProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{p.name}</p>
                    <p className="text-xs text-[#6B7280] truncate">{p.vendor} · {p.sold} sold</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[#111827]">${(p.sold * p.price).toLocaleString()}</p>
                    <p className="text-xs text-[#9CA3AF]">${p.price.toFixed(2)}/ea</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ContentCard>

        {/* New customers */}
        <ContentCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111827]">New Customers</h3>
                <p className="text-xs text-[#6B7280]">Recently joined</p>
              </div>
            </div>
          </div>
          <div className="p-3 space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin">
            {loading ? (
              <p className="text-center text-sm text-[#9CA3AF] py-6">Loading...</p>
            ) : (data?.newCustomers.length || 0) === 0 ? (
              <p className="text-center text-sm text-[#6B7280] py-8">No new customers yet.</p>
            ) : (
              data?.newCustomers.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors"
                >
                  <Avatar className="w-9 h-9 rounded-full shrink-0">
                    <AvatarFallback className="text-xs bg-blue-100 text-primary rounded-full">
                      {c.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{c.name}</p>
                    <p className="text-xs text-[#6B7280] truncate">{c.email}</p>
                  </div>
                  <span className="text-xs text-[#9CA3AF] shrink-0">{timeAgo(c.joinedAt)}</span>
                </motion.div>
              ))
            )}
          </div>
        </ContentCard>
      </div>

      {/* Recent orders + Live activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ContentCard className="lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#111827]">Recent Orders</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">Live feed — most recent orders</p>
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
                  <th className="px-5 py-2.5 font-medium">Restaurant</th>
                  <th className="px-5 py-2.5 font-medium text-right">Total</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-[#9CA3AF]">Loading orders...</td>
                  </tr>
                ) : (data?.recentOrders.length || 0) === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-[#6B7280]">No orders yet.</td>
                  </tr>
                ) : (
                  <AnimatePresence initial={false}>
                    {data?.recentOrders.slice(0, 8).map((o, i) => (
                      <motion.tr
                        key={`${o.id}-${i}`}
                        initial={{ opacity: 0, y: -8, backgroundColor: "rgba(59,130,246,0.06)" }}
                        animate={{ opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0)" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-primary">{o.code}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7 rounded-full">
                              <AvatarFallback className="text-[10px] bg-blue-100 text-primary rounded-full">
                                {o.customer.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[#374151]">{o.customer}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[#4B5563]">{o.vendor}</td>
                        <td className="px-5 py-3 text-right font-semibold text-[#111827]">${o.total.toFixed(2)}</td>
                        <td className="px-5 py-3"><StatusBadge status={normalizeStatus(o.status)} /></td>
                        <td className="px-5 py-3 text-right text-xs text-[#9CA3AF] tabular-nums">{timeAgo(o.time)}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </ContentCard>

        {/* Live activity feed */}
        <ContentCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111827]">Live Activity</h3>
                <p className="text-xs text-[#6B7280]">Real-time platform activity</p>
              </div>
            </div>
          </div>
          <div className="p-3 space-y-1 max-h-[420px] overflow-y-auto scrollbar-thin">
            {loading ? (
              <p className="text-center text-sm text-[#9CA3AF] py-6">Loading activity...</p>
            ) : (data?.recentActivities.length || 0) === 0 ? (
              <p className="text-center text-sm text-[#6B7280] py-8">No activity yet.</p>
            ) : (
              data?.recentActivities.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${ACTIVITY_COLOR[a.type] || "bg-gray-100 text-gray-700"} flex items-center justify-center text-sm shrink-0`}>
                    {ACTIVITY_ICON[a.type] || "•"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#374151] leading-snug">{a.message}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{timeAgo(a.time)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ContentCard>
      </div>

      {/* Quick links strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickLinkCard icon={Store} label="Restaurants" value={k?.totalVendors ?? 0} accent="text-primary" bg="bg-blue-50" />
        <QuickLinkCard icon={Package} label="Products" value={k?.totalProducts ?? 0} accent="text-emerald-600" bg="bg-emerald-50" />
        <QuickLinkCard icon={Users} label="Customers" value={k?.totalCustomers ?? 0} accent="text-violet-600" bg="bg-violet-50" />
        <QuickLinkCard icon={Bell} label="Categories" value={k?.totalCategories ?? 0} accent="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* AI assistant */}
      <ContentCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#111827]">AI Assistant</h3>
              <p className="text-xs text-[#6B7280]">Powered by FoodHub Intelligence</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
            Online
          </Badge>
        </div>

        <div className="px-5 py-4">
          <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-3 mb-4 pr-1">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 ${
                  m.role === "user" ? "bg-[#6B7280]" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                }`}>
                  {m.role === "user" ? "A" : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-[#F3F4F6] text-[#111827] rounded-tl-sm"
                }`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-primary text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your business..."
              className="flex-1 h-11 px-4 rounded-xl bg-[#F3F4F6] border border-transparent text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-primary hover:bg-blue-700 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </ContentCard>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          ⚠️ Error loading dashboard data: {error}. Showing partial data.
        </div>
      )}
    </div>
  );
}

function QuickStatPill({
  label,
  value,
  format = "number",
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  format?: "currency" | "number" | "percent";
  icon: typeof DollarSign;
  color: string;
  bg: string;
}) {
  const animated = useCountUp(value, 1000);
  const display =
    format === "currency"
      ? `$${animated.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : format === "percent"
        ? `${animated.toFixed(1)}%`
        : Math.round(animated).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#E5E7EB] shadow-soft p-4 flex items-center gap-3"
    >
      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[#6B7280] font-medium">{label}</p>
        <p className="text-lg font-bold text-[#111827] tabular-nums truncate">{display}</p>
      </div>
    </motion.div>
  );
}

function QuickLinkCard({
  icon: Icon,
  label,
  value,
  accent,
  bg,
}: {
  icon: typeof Store;
  label: string;
  value: number;
  accent: string;
  bg: string;
}) {
  const animated = useCountUp(value, 1200);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl border border-[#E5E7EB] shadow-soft p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl ${bg} ${accent} flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#111827] tabular-nums">{Math.round(animated).toLocaleString()}</p>
        <p className="text-xs text-[#6B7280]">{label}</p>
      </div>
    </motion.div>
  );
}
