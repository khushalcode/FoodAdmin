"use client";

import { toast } from "sonner";
import { motion } from "framer-motion";
import { Edit, Trash2, Eye } from "lucide-react";
import { PageHeader, ContentCard, StatusBadge, useFakeLoading, GridSkeleton } from "../shared/list-page";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  placement: string;
  views: number;
  clicks: number;
  gradient: string;
  emoji: string;
  status: string;
}

const DATA: Banner[] = [
  { id: 1, title: "Summer Pizza Fest", subtitle: "Up to 40% off all pizzas", cta: "Order now", placement: "Home Hero", views: 14250, clicks: 4120, gradient: "from-orange-500 via-red-500 to-pink-500", emoji: "🍕", status: "Published" },
  { id: 2, title: "Free Delivery Weekend", subtitle: "On all orders over $20", cta: "Grab it", placement: "Home Strip", views: 9820, clicks: 2340, gradient: "from-blue-500 via-cyan-500 to-teal-500", emoji: "🚀", status: "Published" },
  { id: 3, title: "Sushi Sunday", subtitle: "Fresh sushi, every Sunday", cta: "Browse", placement: "Category Top", views: 5240, clicks: 1450, gradient: "from-emerald-500 via-green-500 to-lime-500", emoji: "🍣", status: "Published" },
  { id: 4, title: "Burger Madness", subtitle: "Buy 1 Get 1 Free", cta: "Order", placement: "Home Hero", views: 7310, clicks: 1980, gradient: "from-amber-500 via-orange-500 to-red-500", emoji: "🍔", status: "Scheduled" },
  { id: 5, title: "Healthy Bowls", subtitle: "Fresh & nutritious", cta: "Try now", placement: "Sidebar", views: 3120, clicks: 720, gradient: "from-green-500 via-emerald-500 to-teal-500", emoji: "🥗", status: "Published" },
  { id: 6, title: "Dessert Dash", subtitle: "Sweet endings await", cta: "Order", placement: "Home Strip", views: 0, clicks: 0, gradient: "from-pink-500 via-rose-500 to-red-500", emoji: "🍰", status: "Draft" },
];

export default function BannersPage() {
  const loading = useFakeLoading();

  return (
    <div>
      <PageHeader
        title="Banners"
        description="Promotional banners shown across the customer app"
        actionLabel="Add Banner"
        onAction={() => toast.success("Opening banner designer...")}
      />

      {loading ? (
        <GridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DATA.map((b, i) => {
            const ctr = b.views > 0 ? ((b.clicks / b.views) * 100).toFixed(1) : "0";
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ContentCard className="overflow-hidden h-full">
                  <div className={`relative h-36 bg-gradient-to-br ${b.gradient} flex items-center p-5 overflow-hidden`}>
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -right-12 -bottom-8 w-24 h-24 rounded-full bg-white/10" />
                    <span className="absolute right-4 bottom-2 text-7xl opacity-30">{b.emoji}</span>
                    <div className="relative z-10 text-white max-w-[70%]">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 backdrop-blur text-[10px] font-semibold uppercase tracking-wide mb-1.5">
                        {b.placement}
                      </span>
                      <h3 className="text-xl font-bold leading-tight">{b.title}</h3>
                      <p className="text-sm text-white/90 mt-1">{b.subtitle}</p>
                      <button className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg bg-white text-[#1F2937] text-xs font-semibold hover:bg-white/95">
                        {b.cta} →
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <p className="text-[#9CA3AF]">Views</p>
                        <p className="font-semibold text-[#111827]">{b.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[#9CA3AF]">Clicks</p>
                        <p className="font-semibold text-[#111827]">{b.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[#9CA3AF]">CTR</p>
                        <p className="font-semibold text-emerald-600">{ctr}%</p>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="px-4 pb-3 flex items-center gap-1.5 border-t border-[#F3F4F6] pt-3">
                    <button onClick={() => toast.info(`Previewing ${b.title}`)} className="flex-1 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[#374151] transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button onClick={() => toast.info(`Editing ${b.title}`)} className="flex-1 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => toast.error(`Deleting ${b.title}`)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 inline-flex items-center justify-center text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </ContentCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
