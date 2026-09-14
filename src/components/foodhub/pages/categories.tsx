"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { UtensilsCrossed, Salad, Pizza, Beef, Soup, Croissant, Coffee, Fish } from "lucide-react";
import { PageHeader, ContentCard, StatusBadge, useFakeLoading, GridSkeleton } from "../shared/list-page";

const ICONS = [Pizza, Salad, Beef, Soup, Croissant, Coffee, Fish, UtensilsCrossed];
const COLORS = [
  "from-orange-100 to-red-100 text-red-600",
  "from-green-100 to-emerald-100 text-emerald-600",
  "from-amber-100 to-orange-100 text-amber-600",
  "from-yellow-100 to-amber-100 text-yellow-600",
  "from-pink-100 to-rose-100 text-rose-600",
  "from-brown-100 to-amber-100 text-amber-700",
  "from-blue-100 to-cyan-100 text-cyan-600",
  "from-violet-100 to-purple-100 text-violet-600",
];

const CATEGORIES = [
  { id: 1, name: "Pizza", items: 124, status: "Active", icon: Pizza, color: "from-orange-100 to-red-100 text-red-600" },
  { id: 2, name: "Burgers", items: 87, status: "Active", icon: Beef, color: "from-amber-100 to-orange-100 text-amber-600" },
  { id: 3, name: "Salads", items: 56, status: "Active", icon: Salad, color: "from-green-100 to-emerald-100 text-emerald-600" },
  { id: 4, name: "Sushi", items: 42, status: "Active", icon: Fish, color: "from-blue-100 to-cyan-100 text-cyan-600" },
  { id: 5, name: "Soups", items: 38, status: "Active", icon: Soup, color: "from-yellow-100 to-amber-100 text-yellow-600" },
  { id: 6, name: "Desserts", items: 31, status: "Active", icon: Croissant, color: "from-pink-100 to-rose-100 text-rose-600" },
  { id: 7, name: "Beverages", items: 64, status: "Active", icon: Coffee, color: "from-brown-100 to-amber-100 text-amber-700" },
  { id: 8, name: "Pasta", items: 49, status: "Inactive", icon: UtensilsCrossed, color: "from-violet-100 to-purple-100 text-violet-600" },
];

export default function CategoriesPage() {
  const loading = useFakeLoading();

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage your food menu categories"
        actionLabel="Add Category"
        onAction={() => toast.success("Opening new category form...")}
      />

      {loading ? (
        <GridSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon || ICONS[i % ICONS.length];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
              >
                <ContentCard className="p-5 h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <h3 className="text-base font-semibold text-[#111827]">{c.name}</h3>
                  <p className="text-sm text-[#6B7280] mt-0.5">{c.items} dishes</p>
                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#F3F4F6]">
                    <button
                      onClick={() => toast.info(`Editing ${c.name}`)}
                      className="flex-1 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs font-medium text-[#374151] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toast.info(`Viewing ${c.name} dishes`)}
                      className="flex-1 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs font-medium text-primary transition-colors"
                    >
                      View Dishes
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
