"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Megaphone, Plus, Eye, Pencil, Trash2, Calendar, Percent, Users } from "lucide-react";
import { PageHeader, ContentCard, StatusBadge } from "../../shared/list-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: string;
  name: string;
  type: "Discount" | "BOGO" | "Free Delivery" | "Flash Sale" | "Bundle";
  status: "Running" | "Scheduled" | "Expired" | "Draft";
  discount: number;
  startDate: string;
  endDate: string;
  reach: number;
  used: number;
  revenue: number;
  emoji: string;
  gradient: string;
}

const CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Winter Warm-Up Sale", type: "Discount", status: "Running", discount: 25, startDate: "Dec 1", endDate: "Dec 31", reach: 4820, used: 312, revenue: 12480, emoji: "❄️", gradient: "from-blue-100 to-cyan-100" },
  { id: "c2", name: "Friday BOGO Special", type: "BOGO", status: "Running", discount: 50, startDate: "Every Friday", endDate: "Ongoing", reach: 1840, used: 89, revenue: 3240, emoji: "🎉", gradient: "from-emerald-100 to-teal-100" },
  { id: "c3", name: "New Year Flash Sale", type: "Flash Sale", status: "Scheduled", discount: 40, startDate: "Jan 1", endDate: "Jan 3", reach: 0, used: 0, revenue: 0, emoji: "✨", gradient: "from-amber-100 to-orange-100" },
  { id: "c4", name: "Free Delivery Weekend", type: "Free Delivery", status: "Scheduled", discount: 0, startDate: "Dec 14", endDate: "Dec 15", reach: 0, used: 0, revenue: 0, emoji: "🚀", gradient: "from-violet-100 to-purple-100" },
  { id: "c5", name: "Summer BBQ Bundle", type: "Bundle", status: "Expired", discount: 15, startDate: "Jun 1", endDate: "Aug 31", reach: 6240, used: 528, revenue: 18960, emoji: "🔥", gradient: "from-orange-100 to-red-100" },
  { id: "c6", name: "Holiday Family Pack", type: "Bundle", status: "Draft", discount: 20, startDate: "—", endDate: "—", reach: 0, used: 0, revenue: 0, emoji: "👨‍👩‍👧", gradient: "from-pink-100 to-rose-100" },
];

const FILTERS = ["All", "Running", "Scheduled", "Draft", "Expired"];

export default function VendorCampaigns() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.status === filter);

  const totalReach = CAMPAIGNS.reduce((s, c) => s + c.reach, 0);
  const totalUsed = CAMPAIGNS.reduce((s, c) => s + c.used, 0);
  const totalRevenue = CAMPAIGNS.reduce((s, c) => s + c.revenue, 0);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Promote your store with discounts, bundles, and flash sales"
        actionLabel="New Campaign"
        onAction={() => toast.success("Opening campaign builder...")}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <ContentCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Total Reach</p>
              <p className="text-2xl font-bold text-[#111827]">{totalReach.toLocaleString()}</p>
            </div>
          </div>
        </ContentCard>
        <ContentCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Used</p>
              <p className="text-2xl font-bold text-[#111827]">{totalUsed.toLocaleString()}</p>
            </div>
          </div>
        </ContentCard>
        <ContentCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Revenue</p>
              <p className="text-2xl font-bold text-[#111827]">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </ContentCard>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 h-9 px-3.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-white text-[#374151] border border-[#E5E7EB] hover:bg-[#F9FAFB]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Campaign grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            whileHover={{ y: -3 }}
          >
            <ContentCard className="overflow-hidden h-full">
              <div className={`relative h-24 bg-gradient-to-br ${c.gradient} flex items-center justify-between px-4`}>
                <span className="text-4xl">{c.emoji}</span>
                <StatusBadge status={c.status} />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#111827] truncate">{c.name}</h3>
                    <Badge variant="secondary" className="mt-1 bg-blue-50 text-primary hover:bg-blue-50 text-[10px]">
                      {c.type}
                    </Badge>
                  </div>
                  {c.discount > 0 && (
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-primary">{c.discount}%</p>
                      <p className="text-[10px] text-[#9CA3AF]">off</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[#6B7280]">
                    <Calendar className="w-3 h-3" />
                    {c.startDate} → {c.endDate}
                  </div>
                  <div className="flex items-center gap-3 text-[#4B5563]">
                    <span><span className="font-semibold text-[#111827]">{c.reach.toLocaleString()}</span> reach</span>
                    <span><span className="font-semibold text-[#111827]">{c.used}</span> used</span>
                    {c.revenue > 0 && (
                      <span><span className="font-semibold text-emerald-600">${c.revenue.toLocaleString()}</span> rev</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex items-center gap-1">
                  <button onClick={() => toast.info(`Viewing ${c.name}`)} className="flex-1 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] inline-flex items-center justify-center text-[#6B7280] transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toast.info(`Editing ${c.name}`)} className="flex-1 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 inline-flex items-center justify-center text-emerald-600 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toast.error(`Deleting ${c.name}`)} className="flex-1 h-8 rounded-lg bg-red-50 hover:bg-red-100 inline-flex items-center justify-center text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </ContentCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
