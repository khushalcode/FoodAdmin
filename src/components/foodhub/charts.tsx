"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayPoint, SalesPoint } from "./use-live-data";

const tooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 12px",
};

export function SalesAreaChart({ data }: { data: SalesPoint[] }) {
  return (
    <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-soft">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-[#111827]">Total Sales</CardTitle>
          <p className="text-xs text-[#6B7280] mt-0.5">Revenue & profit over the last 30 min</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-[#6B7280]">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Sales
          </span>
          <span className="flex items-center gap-1.5 text-[#6B7280]">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Profit
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="t"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                minTickGap={50}
              />
              <YAxis
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fill="url(#salesGrad)"
                isAnimationActive
                animationDuration={900}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#profitGrad)"
                isAnimationActive
                animationDuration={900}
                animationBegin={200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function DailyActiveBarChart({ data }: { data: DayPoint[] }) {
  return (
    <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-[#111827]">Daily Active Orders</CardTitle>
        <p className="text-xs text-[#6B7280] mt-0.5">Orders per day this week</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F9FAFB" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.highlight ? "#3B82F6" : "#E5E7EB"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryDonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-soft h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-[#111827]">Orders by Category</CardTitle>
        <p className="text-xs text-[#6B7280] mt-0.5">Distribution this month</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={84}
                paddingAngle={2}
                isAnimationActive
                animationDuration={900}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-[#111827]">
              {data.reduce((a, b) => a + b.value, 0).toLocaleString()}
            </span>
            <span className="text-xs text-[#6B7280]">total</span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                <span className="text-[#4B5563]">{d.name}</span>
              </div>
              <span className="font-semibold text-[#111827]">{d.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RepeatCustomerGauge({ value }: { value: number }) {
  const data = [{ name: "repeat", value, fill: "#3B82F6" }];
  return (
    <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-soft h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-[#111827]">Repeat Customer Rate</CardTitle>
        <p className="text-xs text-[#6B7280] mt-0.5">Returning customers this month</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              data={data}
              startAngle={210}
              endAngle={-30}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                background={{ fill: "#F3F4F6" }}
                dataKey="value"
                cornerRadius={20}
                isAnimationActive
                animationDuration={1100}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-[#111827]">{value}%</span>
            <Badge variant="secondary" className="mt-1 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              +2.4% vs last month
            </Badge>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-[#F9FAFB] py-2">
            <p className="text-sm font-bold text-[#111827]">68%</p>
            <p className="text-[10px] text-[#9CA3AF]">New</p>
          </div>
          <div className="rounded-lg bg-[#F9FAFB] py-2">
            <p className="text-sm font-bold text-[#111827]">{value}%</p>
            <p className="text-[10px] text-[#9CA3AF]">Repeat</p>
          </div>
          <div className="rounded-lg bg-[#F9FAFB] py-2">
            <p className="text-sm font-bold text-[#111827]">7%</p>
            <p className="text-[10px] text-[#9CA3AF]">VIP</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
