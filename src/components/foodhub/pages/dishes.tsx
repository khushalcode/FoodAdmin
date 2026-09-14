"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Plus, Eye, Pencil, Trash2, Star } from "lucide-react";
import { PageHeader, ContentCard, useFakeLoading, GridSkeleton, StatusBadge } from "../shared/list-page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  category: string | null;
  vendor: string;
  price: number;
  discount: number;
  rating: number;
  totalSold: number;
  stock: number;
  isVeg: boolean;
  isFeatured: boolean;
  isActive: boolean;
  emoji?: string;
  gradient?: string;
}

const EMOJIS = ["🍕", "🍔", "🍣", "🥗", "🍛", "🍜", "🌮", "🥑", "🍝", "🍚", "🍲", "🍫", "🥤", "🧃", "☕", "🍰"];
const GRADIENTS = [
  "from-red-50 to-orange-50",
  "from-amber-50 to-yellow-50",
  "from-blue-50 to-cyan-50",
  "from-green-50 to-emerald-50",
  "from-orange-50 to-red-50",
  "from-amber-50 to-orange-50",
  "from-yellow-50 to-amber-50",
  "from-green-50 to-lime-50",
  "from-red-50 to-pink-50",
  "from-orange-50 to-amber-50",
  "from-red-50 to-rose-50",
  "from-amber-50 to-yellow-50",
];

const FALLBACK: Product[] = [
  { id: "fb-1", name: "Margherita Pizza", category: "Pizza", vendor: "Bella Italia", price: 12.99, discount: 0, rating: 4.8, totalSold: 1248, stock: 45, isVeg: true, isFeatured: true, isActive: true },
  { id: "fb-2", name: "Beef Burger Deluxe", category: "Burgers", vendor: "Burger Bros", price: 11.49, discount: 0, rating: 4.7, totalSold: 1102, stock: 30, isVeg: false, isFeatured: false, isActive: true },
  { id: "fb-3", name: "Spicy Tuna Roll", category: "Sushi", vendor: "Sushi Express", price: 16.99, discount: 10, rating: 4.9, totalSold: 894, stock: 12, isVeg: false, isFeatured: true, isActive: true },
];

export default function DishesPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const fakeLoading = useFakeLoading(450);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const mapped: Product[] = (json || []).map((p: any, i: number) => ({
          id: p.id,
          name: p.name,
          category: p.category || "Uncategorized",
          vendor: p.vendor || "—",
          price: p.price,
          discount: p.discount,
          rating: p.rating,
          totalSold: p.totalSold,
          stock: p.stock,
          isVeg: p.isVeg,
          isFeatured: p.isFeatured,
          isActive: p.isActive,
          emoji: EMOJIS[i % EMOJIS.length],
          gradient: GRADIENTS[i % GRADIENTS.length],
        }));
        setProducts(mapped);
      } catch (e) {
        if (!cancelled) {
          setProducts(FALLBACK);
          toast.error("Failed to load products — showing sample data");
        }
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = products || [];
  const cats = ["All", ...Array.from(new Set(list.map((d) => d.category || "Uncategorized")))];
  const filtered = list.filter(
    (d) =>
      (d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.vendor.toLowerCase().includes(search.toLowerCase())) &&
      (category === "All" || d.category === category),
  );

  if (apiLoading || fakeLoading) {
    return (
      <div>
        <PageHeader title="Dishes" description="Manage your menu — prices, stock, ratings" actionLabel="Add Dish" onAction={() => toast.success("Opening dish form...")} />
        <div className="flex flex-col md:flex-row gap-2.5 mb-4">
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
        <GridSkeleton count={12} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dishes"
        description={`${list.length} products across all vendors`}
        actionLabel="Add Dish"
        onAction={() => toast.success("Opening dish form...")}
      />

      <div className="flex flex-col md:flex-row gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes..."
            className="pl-9 h-10 rounded-lg bg-white border-[#E5E7EB]"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 md:pb-0">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 h-10 px-3.5 rounded-lg text-xs font-medium border transition-colors ${
                category === c
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F9FAFB]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-sm text-[#6B7280]">No dishes match your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d, i) => {
            const finalPrice = d.discount > 0 ? d.price * (1 - d.discount / 100) : d.price;
            const stockLabel = d.stock === 0 ? "Out of stock" : d.stock < 15 ? "Low stock" : "In stock";
            const stockColor = d.stock === 0 ? "text-red-600" : d.stock < 15 ? "text-amber-600" : "text-emerald-600";
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                whileHover={{ y: -4 }}
              >
                <ContentCard className="overflow-hidden h-full">
                  <div className={`relative h-32 bg-gradient-to-br ${d.gradient} flex items-center justify-center`}>
                    <span className="text-5xl">{d.emoji}</span>
                    <div className="absolute top-2 left-2 flex gap-1">
                      {d.isVeg ? (
                        <span className="w-5 h-5 rounded bg-emerald-500 inline-flex items-center justify-center text-white text-[10px]">V</span>
                      ) : (
                        <span className="w-5 h-5 rounded bg-red-500 inline-flex items-center justify-center text-white text-[10px]">N</span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={d.isActive ? "Active" : "Inactive"} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#111827] truncate">{d.name}</h3>
                        <p className="text-xs text-[#6B7280] mt-0.5 truncate">{d.vendor}</p>
                      </div>
                      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {d.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-primary">${finalPrice.toFixed(2)}</span>
                        {d.discount > 0 && (
                          <span className="text-xs text-[#9CA3AF] line-through">${d.price.toFixed(2)}</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${stockColor}`}>
                        {stockLabel} ({d.stock})
                      </span>
                    </div>
                    {d.totalSold > 0 && (
                      <p className="mt-2 text-[11px] text-[#9CA3AF]">{d.totalSold.toLocaleString()} sold</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex items-center gap-1">
                      <button onClick={() => toast.info(`Viewing ${d.name}`)} className="flex-1 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] inline-flex items-center justify-center text-[#6B7280] transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toast.info(`Editing ${d.name}`)} className="flex-1 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 inline-flex items-center justify-center text-emerald-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toast.error(`Deleting ${d.name}`)} className="flex-1 h-8 rounded-lg bg-red-50 hover:bg-red-100 inline-flex items-center justify-center text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
