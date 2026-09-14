"use client";

import { toast } from "sonner";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import { PageHeader, ContentCard, StatusBadge, useFakeLoading, GridSkeleton } from "../shared/list-page";

interface Banner {
  id: number;
  title: string;
  placement: string;
  size: string;
  gradient: string;
  emoji: string;
  impressions: number;
  status: string;
}

const DATA: Banner[] = [
  { id: 1, title: "Restaurant Spotlight", placement: "Restaurant Page Top", size: "728×90", gradient: "from-violet-500 via-purple-500 to-indigo-500", emoji: "⭐", impressions: 32450, status: "Published" },
  { id: 2, title: "Delivery App Banner", placement: "Order Tracking", size: "320×50", gradient: "from-cyan-500 via-blue-500 to-indigo-500", emoji: "🚚", impressions: 21500, status: "Published" },
  { id: 3, title: "Sidebar Promo", placement: "Cart Sidebar", size: "300×250", gradient: "from-amber-500 via-orange-500 to-red-500", emoji: "🎁", impressions: 9120, status: "Published" },
  { id: 4, title: "Footer Banner", placement: "Footer", size: "970×90", gradient: "from-emerald-500 via-green-500 to-teal-500", emoji: "🌿", impressions: 18900, status: "Published" },
  { id: 5, title: "Mobile Splash", placement: "App Splash", size: "360×640", gradient: "from-pink-500 via-rose-500 to-red-500", emoji: "🍰", impressions: 0, status: "Draft" },
  { id: 6, title: "Checkout Banner", placement: "Checkout Page", size: "320×100", gradient: "from-blue-500 via-cyan-500 to-teal-500", emoji: "✨", impressions: 12450, status: "Published" },
];

export default function OtherBannersPage() {
  const loading = useFakeLoading();
  return (
    <div>
      <PageHeader
        title="Other Banners"
        description="Secondary banners for restaurant pages, app splash, and more"
        actionLabel="Add Banner"
        onAction={() => toast.success("Opening banner form...")}
      />
      {loading ? (
        <GridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATA.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <ContentCard className="overflow-hidden h-full">
                <div className={`relative h-28 bg-gradient-to-br ${b.gradient} flex items-center justify-center overflow-hidden`}>
                  <span className="text-5xl opacity-50">{b.emoji}</span>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/30 backdrop-blur text-white text-[10px] font-medium">
                    {b.size}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[#111827]">{b.title}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-[#6B7280]">{b.placement}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{b.impressions.toLocaleString()} impressions</p>
                  <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex gap-1.5">
                    <button onClick={() => toast.info(`Editing ${b.title}`)} className="flex-1 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => toast.error(`Deleting ${b.title}`)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 inline-flex items-center justify-center text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </ContentCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
