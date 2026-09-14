"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { Star, TrendingUp, Award, Gift } from "lucide-react";
import { PageHeader, ContentCard, StatusBadge, useFakeLoading } from "../shared/list-page";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Member {
  id: string;
  name: string;
  tier: string;
  points: number;
  nextTier: number;
  redeemed: number;
  status: string;
}

const DATA: Member[] = [
  { id: "LP-01", name: "Sophia Patel", tier: "Platinum", points: 4820, nextTier: 5000, redeemed: 1180, status: "Active" },
  { id: "LP-02", name: "Emma Garcia", tier: "Platinum", points: 8240, nextTier: 10000, redeemed: 2340, status: "Active" },
  { id: "LP-03", name: "Ethan Davis", tier: "Gold", points: 3120, nextTier: 5000, redeemed: 720, status: "Active" },
  { id: "LP-04", name: "Olivia Martin", tier: "Silver", points: 1840, nextTier: 3000, redeemed: 240, status: "Active" },
  { id: "LP-05", name: "Lucas Kim", tier: "Gold", points: 2240, nextTier: 5000, redeemed: 380, status: "Active" },
  { id: "LP-06", name: "Ava Rodriguez", tier: "Platinum", points: 9820, nextTier: 10000, redeemed: 1180, status: "Active" },
  { id: "LP-07", name: "Liam Chen", tier: "Gold", points: 4180, nextTier: 5000, redeemed: 920, status: "Active" },
];

const TIER_COLOR: Record<string, string> = {
  Platinum: "from-violet-500 to-purple-600",
  Gold: "from-amber-500 to-yellow-600",
  Silver: "from-slate-400 to-gray-500",
};

const AVATAR_COLORS = ["from-pink-500 to-rose-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-blue-500 to-indigo-600", "from-cyan-500 to-blue-600", "from-rose-500 to-pink-600", "from-violet-500 to-purple-600"];

export default function LoyaltyPointsPage() {
  const loading = useFakeLoading();
  const totalRedeemed = DATA.reduce((s, m) => s + m.redeemed, 0);

  return (
    <div>
      <PageHeader
        title="Loyalty Points"
        description="Customer loyalty program members & their point balances"
        actionLabel="Award Points"
        onAction={() => toast.success("Opening award form...")}
      />

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Active Members", value: "1,247", icon: Star, color: "text-amber-600 bg-amber-50" },
          { label: "Points Issued", value: "428.6k", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
          { label: "Points Redeemed", value: `${(totalRedeemed / 1000).toFixed(1)}k`, icon: Gift, color: "text-violet-600 bg-violet-50" },
          { label: "Platinum Tier", value: "84", icon: Award, color: "text-blue-600 bg-blue-50" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ContentCard className="p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-[#111827] mt-3">{s.value}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{s.label}</p>
              </ContentCard>
            </motion.div>
          );
        })}
      </div>

      {/* Member table */}
      <ContentCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#111827]">Loyalty Members</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">Members approaching next tier highlighted</p>
        </div>
        {loading ? (
          <div className="p-5 space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {DATA.map((m, i) => {
              const progress = Math.min(100, (m.points / m.nextTier) * 100);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-3 md:w-72 shrink-0">
                    <Avatar className="w-10 h-10 rounded-full">
                      <AvatarFallback className={`bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white text-xs rounded-full font-semibold`}>
                        {m.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[#111827]">{m.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{m.id}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-white text-xs font-semibold bg-gradient-to-r ${TIER_COLOR[m.tier]}`}>{m.tier}</span>
                      <span className="text-[#6B7280]">{m.points.toLocaleString()} / {m.nextTier.toLocaleString()} pts</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">{m.redeemed.toLocaleString()} pts</p>
                    <p className="text-xs text-[#9CA3AF]">redeemed</p>
                  </div>
                  <StatusBadge status={m.status} />
                </motion.div>
              );
            })}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
