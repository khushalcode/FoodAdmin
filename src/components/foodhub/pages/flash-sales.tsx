"use client";

import { toast } from "sonner";
import { motion } from "framer-motion";
import { Zap, Clock, TrendingUp, Edit, Trash2 } from "lucide-react";
import { PageHeader, ContentCard, StatusBadge, useFakeLoading, GridSkeleton } from "../shared/list-page";

interface FlashSale {
  id: number;
  name: string;
  dish: string;
  emoji: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  sold: number;
  total: number;
  endsIn: string;
  status: string;
}

const DATA: FlashSale[] = [
  { id: 1, name: "Flash Friday Pizza", dish: "Margherita Pizza", emoji: "🍕", originalPrice: 12.99, salePrice: 8.99, discount: 31, sold: 142, total: 200, endsIn: "3h 24m", status: "Running" },
  { id: 2, name: "Sushi Sunday Special", dish: "Spicy Tuna Roll", emoji: "🍣", originalPrice: 16.99, salePrice: 11.99, discount: 29, sold: 87, total: 150, endsIn: "5h 12m", status: "Running" },
  { id: 3, name: "Burger Madness", dish: "Beef Burger Deluxe", emoji: "🍔", originalPrice: 11.49, salePrice: 7.99, discount: 30, sold: 198, total: 250, endsIn: "1h 45m", status: "Running" },
  { id: 4, name: "Curry Night", dish: "Chicken Tikka", emoji: "🍛", originalPrice: 14.99, salePrice: 9.99, discount: 33, sold: 56, total: 100, endsIn: "0h 30m", status: "Running" },
  { id: 5, name: "Salad Week", dish: "Caesar Salad", emoji: "🥗", originalPrice: 9.49, salePrice: 6.99, discount: 26, sold: 220, total: 220, endsIn: "Ended", status: "Expired" },
  { id: 6, name: "Taco Tuesday", dish: "Beef Tacos", emoji: "🌮", originalPrice: 10.99, salePrice: 7.49, discount: 32, sold: 0, total: 180, endsIn: "Starts in 2d", status: "Scheduled" },
  { id: 7, name: "Noodle Fest", dish: "Pad Thai", emoji: "🍜", originalPrice: 12.49, salePrice: 8.99, discount: 28, sold: 0, total: 120, endsIn: "Starts in 5d", status: "Scheduled" },
  { id: 8, name: "Dessert Dash", dish: "Chocolate Cake", emoji: "🍰", originalPrice: 6.49, salePrice: 4.49, discount: 31, sold: 0, total: 100, endsIn: "Draft", status: "Draft" },
];

export default function FlashSalesPage() {
  const loading = useFakeLoading();

  return (
    <div>
      <PageHeader
        title="Flash Sales"
        description="Time-limited promotions with deep discounts"
        actionLabel="Create Flash Sale"
        onAction={() => toast.success("Opening flash sale form...")}
      />

      {loading ? (
        <GridSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DATA.map((s, i) => {
            const pct = Math.round((s.sold / s.total) * 100);
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                whileHover={{ y: -3 }}
              >
                <ContentCard className="overflow-hidden h-full">
                  <div className="relative h-28 bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 flex items-center justify-center">
                    <span className="text-5xl">{s.emoji}</span>
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500 text-white text-xs font-bold shadow-sm">
                        <Zap className="w-3 h-3 fill-white" />
                        -{s.discount}%
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#111827]">{s.name}</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">{s.dish}</p>

                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-red-600">${s.salePrice.toFixed(2)}</span>
                      <span className="text-xs text-[#9CA3AF] line-through">${s.originalPrice.toFixed(2)}</span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#6B7280]">{s.sold} / {s.total} sold</span>
                        <span className="font-medium text-[#111827]">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-[#F3F4F6]">
                      <span className="text-xs text-[#6B7280] inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.endsIn}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toast.info(`Editing ${s.name}`)} className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#6B7280] hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toast.error(`Deleting ${s.name}`)} className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
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
