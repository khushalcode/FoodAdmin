"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Eye, Pencil, Trash2, Star, Flame } from "lucide-react";
import { PageHeader, ContentCard, useFakeLoading, StatusBadge } from "../../shared/list-page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchOnce } from "../use-vendor-data";
import type { AuthVendor } from "../../login-page";

interface VendorProductsProps {
  vendor: AuthVendor | null;
}

interface Product {
  id: string;
  name: string;
  category: string | null;
  price: number;
  discount: number;
  stock: number;
  isVeg: boolean;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  totalSold: number;
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

export default function VendorProducts({ vendor }: VendorProductsProps) {
  const url = vendor ? `/api/vendor/products?vendorId=${vendor.id}` : null;
  const { data: products, loading, forceRefresh } = useFetchOnce<Product[]>(url);
  const fakeLoading = useFakeLoading(450);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const list = products || [];
  const cats = ["All", ...Array.from(new Set(list.map((p) => p.category || "Uncategorized")))];
  const filtered = list.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || p.category === category),
  );

  const isLoading = loading || fakeLoading;

  return (
    <div>
      <PageHeader
        title="Products"
        description="Your store menu — manage prices, stock, and visibility"
        actionLabel="Add Product"
        onAction={() => toast.success("Opening product form...")}
      />

      <div className="flex flex-col md:flex-row gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
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
          <button
            onClick={() => {
              forceRefresh();
              toast.success("Products refreshed");
            }}
            className="shrink-0 h-10 px-3.5 rounded-lg text-xs font-medium bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-sm text-[#6B7280]">
          No products yet. Click <span className="font-medium text-primary">Add Product</span> to create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => {
            const emoji = EMOJIS[i % EMOJIS.length];
            const gradient = GRADIENTS[i % GRADIENTS.length];
            const finalPrice = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
            const stockLabel = p.stock === 0 ? "Out of stock" : p.stock < 10 ? "Low stock" : "In stock";
            const stockColor = p.stock === 0 ? "text-red-600" : p.stock < 10 ? "text-amber-600" : "text-emerald-600";
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                whileHover={{ y: -4 }}
              >
                <ContentCard className="overflow-hidden h-full">
                  <div className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <span className="text-5xl">{emoji}</span>
                    <div className="absolute top-2 left-2 flex gap-1">
                      {p.isVeg ? (
                        <span className="w-5 h-5 rounded bg-emerald-500 inline-flex items-center justify-center text-white text-[10px]">V</span>
                      ) : (
                        <span className="w-5 h-5 rounded bg-red-500 inline-flex items-center justify-center text-white text-[10px]">N</span>
                      )}
                      {p.isFeatured && (
                        <span className="w-5 h-5 rounded bg-amber-500 inline-flex items-center justify-center text-white">
                          <Flame className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={p.isActive ? "Active" : "Inactive"} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#111827] truncate">{p.name}</h3>
                        <p className="text-xs text-[#6B7280] mt-0.5 truncate">{p.category || "Uncategorized"}</p>
                      </div>
                      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {p.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-primary">${finalPrice.toFixed(2)}</span>
                        {p.discount > 0 && (
                          <span className="text-xs text-[#9CA3AF] line-through">${p.price.toFixed(2)}</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${stockColor}`}>{stockLabel} ({p.stock})</span>
                    </div>
                    {p.totalSold > 0 && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-blue-50 text-primary hover:bg-blue-50">
                          {p.totalSold} sold
                        </Badge>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex items-center gap-1">
                      <button onClick={() => toast.info(`Viewing ${p.name}`)} className="flex-1 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] inline-flex items-center justify-center text-[#6B7280] transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toast.info(`Editing ${p.name}`)} className="flex-1 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 inline-flex items-center justify-center text-emerald-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toast.error(`Deleting ${p.name}`)} className="flex-1 h-8 rounded-lg bg-red-50 hover:bg-red-100 inline-flex items-center justify-center text-red-600 transition-colors">
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
