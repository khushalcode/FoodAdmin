"use client";

import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, ContentCard } from "../shared/list-page";

const salesData = [
  { month: "Jan", sales: 42000, profit: 12000 },
  { month: "Feb", sales: 48000, profit: 14000 },
  { month: "Mar", sales: 51000, profit: 15500 },
  { month: "Apr", sales: 47000, profit: 13200 },
  { month: "May", sales: 58000, profit: 18200 },
  { month: "Jun", sales: 62000, profit: 19800 },
  { month: "Jul", sales: 71000, profit: 23400 },
  { month: "Aug", sales: 68000, profit: 21600 },
  { month: "Sep", sales: 75000, profit: 24800 },
  { month: "Oct", sales: 82000, profit: 28200 },
  { month: "Nov", sales: 91000, profit: 31400 },
  { month: "Dec", sales: 98000, profit: 34600 },
];

const categoriesData = [
  { name: "Pizza", value: 32, color: "#3B82F6" },
  { name: "Burgers", value: 24, color: "#10B981" },
  { name: "Sushi", value: 18, color: "#F59E0B" },
  { name: "Salads", value: 14, color: "#8B5CF6" },
  { name: "Drinks", value: 12, color: "#EF4444" },
];

const channelData = [
  { name: "Mobile App", value: 4820 },
  { name: "Website", value: 2480 },
  { name: "POS", value: 1240 },
  { name: "Phone", value: 320 },
];

const tooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 12px",
};

const KPIS = [
  { label: "YTD Revenue", value: "$824k", delta: "+18.4%", positive: true, icon: DollarSign, accent: "bg-blue-100 text-primary" },
  { label: "Total Orders", value: "32,180", delta: "+12.6%", positive: true, icon: ShoppingCart, accent: "bg-emerald-100 text-emerald-600" },
  { label: "New Customers", value: "4,820", delta: "+8.1%", positive: true, icon: Users, accent: "bg-violet-100 text-violet-600" },
  { label: "Avg Rating", value: "4.7", delta: "-0.2", positive: false, icon: TrendingUp, accent: "bg-amber-100 text-amber-600" },
];

export default function ReportsOverviewPage() {
  return (
    <div>
      <PageHeader
        title="Reports Overview"
        description="High-level performance summary across all metrics"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {KPIS.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ContentCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-md ${k.positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {k.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {k.delta}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">{k.label}</p>
                <p className="mt-1 text-2xl font-bold text-[#111827]">{k.value}</p>
              </ContentCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <ContentCard className="lg:col-span-2 p-5">
          <h3 className="text-base font-semibold text-[#111827]">Revenue & Profit</h3>
          <p className="text-xs text-[#6B7280] mt-0.5 mb-4">Monthly trend YTD</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="r-sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="r-profit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2.5} fill="url(#r-sales)" isAnimationActive animationDuration={1000} />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fill="url(#r-profit)" isAnimationActive animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>

        <ContentCard className="p-5">
          <h3 className="text-base font-semibold text-[#111827]">Sales by Category</h3>
          <p className="text-xs text-[#6B7280] mt-0.5 mb-4">Distribution YTD</p>
          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoriesData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} paddingAngle={2} isAnimationActive animationDuration={900}>
                  {categoriesData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-[#111827]">100%</span>
              <span className="text-xs text-[#6B7280]">categorized</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {categoriesData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                  <span className="text-[#4B5563]">{c.name}</span>
                </div>
                <span className="font-semibold text-[#111827]">{c.value}%</span>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ContentCard className="p-5">
          <h3 className="text-base font-semibold text-[#111827]">Orders by Channel</h3>
          <p className="text-xs text-[#6B7280] mt-0.5 mb-4">Where orders come from</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} tickLine={false} axisLine={false} width={50} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F9FAFB" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={900}>
                  {channelData.map((_, i) => <Cell key={i} fill={i === 0 ? "#3B82F6" : "#E5E7EB"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>

        <ContentCard className="p-5">
          <h3 className="text-base font-semibold text-[#111827]">Profit Margin Trend</h3>
          <p className="text-xs text-[#6B7280] mt-0.5 mb-4">Monthly % margin</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData.map((d) => ({ month: d.month, margin: ((d.profit / d.sales) * 100).toFixed(1) }))} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: string) => `${v}%`} />
                <Line type="monotone" dataKey="margin" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", r: 4 }} isAnimationActive animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
