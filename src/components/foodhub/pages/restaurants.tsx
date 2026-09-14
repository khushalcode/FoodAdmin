"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Star, MoreHorizontal, MapPin, Clock, Package } from "lucide-react";
import { PageHeader, ContentCard, StatusBadge, useFakeLoading, GridSkeleton } from "../shared/list-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  owner: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  cuisine: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  openTime: string;
  closeTime: string;
  balance: number;
  commissionPct: number;
  productCount: number;
  orderCount: number;
  revenue: number;
  emoji: string;
  gradient: string;
}

const CUISINE_EMOJI: Record<string, string> = {
  Italian: "🍝", Japanese: "🍣", Indian: "🍛", American: "🍔",
  Vietnamese: "🍜", Mexican: "🌮", Healthy: "🥗", Chinese: "🥘",
  Thai: "🍤", Default: "🍽️",
};

const GRADIENTS = [
  "from-red-100 to-orange-100", "from-blue-100 to-cyan-100", "from-amber-100 to-orange-100",
  "from-yellow-100 to-amber-100", "from-green-100 to-emerald-100", "from-orange-100 to-red-100",
  "from-emerald-100 to-teal-100", "from-red-100 to-rose-100",
];

const FALLBACK: Restaurant[] = [
  {
    id: "fb-1", name: "Bella Italia", slug: "bella-italia", owner: "Marco Rossi",
    email: "marco@bellaitalia.com", phone: "+1 555-0100", address: "123 Main St", city: "San Francisco",
    cuisine: "Italian", rating: 4.8, reviewCount: 312, isVerified: true, isActive: true,
    openTime: "09:00", closeTime: "22:00", balance: 12480, commissionPct: 10,
    productCount: 24, orderCount: 1248, revenue: 24860, emoji: "🍝", gradient: "from-red-100 to-orange-100",
  },
  {
    id: "fb-2", name: "Sushi Express", slug: "sushi-express", owner: "Yuki Tanaka",
    email: "yuki@sushiexpress.com", phone: "+1 555-0101", address: "456 Oak Ave", city: "San Francisco",
    cuisine: "Japanese", rating: 4.9, reviewCount: 248, isVerified: true, isActive: true,
    openTime: "11:00", closeTime: "23:00", balance: 18420, commissionPct: 8,
    productCount: 32, orderCount: 894, revenue: 18420, emoji: "🍣", gradient: "from-blue-100 to-cyan-100",
  },
];

const COLORS = ["from-red-500 to-orange-600", "from-blue-500 to-cyan-600", "from-amber-500 to-orange-600", "from-yellow-500 to-amber-600", "from-green-500 to-emerald-600", "from-orange-500 to-red-600", "from-emerald-500 to-teal-600", "from-red-500 to-rose-600"];

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const fakeLoading = useFakeLoading(450);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/vendors", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const mapped: Restaurant[] = (json || []).map((v: any, i: number) => ({
          id: v.id,
          name: v.name,
          slug: v.slug,
          owner: v.owner,
          email: v.email,
          phone: v.phone,
          address: v.address,
          city: v.city,
          cuisine: v.city || "International",
          rating: v.rating,
          reviewCount: v.reviewCount,
          isVerified: v.isVerified,
          isActive: v.isActive,
          openTime: v.openTime,
          closeTime: v.closeTime,
          balance: v.balance,
          commissionPct: v.commissionPct,
          productCount: v.productCount,
          orderCount: v.orderCount,
          revenue: Math.round(v.balance * 2),
          emoji: CUISINE_EMOJI[v.city] || CUISINE_EMOJI.Default,
          gradient: GRADIENTS[i % GRADIENTS.length],
        }));
        setRestaurants(mapped);
      } catch (e) {
        if (!cancelled) {
          setRestaurants(FALLBACK);
          toast.error("Failed to load vendors — showing sample data");
        }
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (apiLoading || fakeLoading) {
    return (
      <div>
        <PageHeader title="Restaurants" description="Partner restaurants on FoodHub" actionLabel="Add Restaurant" onAction={() => toast.success("Opening restaurant form...")} />
        <GridSkeleton count={8} />
      </div>
    );
  }

  const list = restaurants || FALLBACK;

  return (
    <div>
      <PageHeader
        title="Restaurants"
        description={`${list.length} partner restaurants`}
        actionLabel="Add Restaurant"
        onAction={() => toast.success("Opening restaurant form...")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }} whileHover={{ y: -3 }}>
            <ContentCard className="overflow-hidden h-full">
              <div className={`relative h-24 bg-gradient-to-br ${r.gradient} flex items-end p-3`}>
                <span className="absolute right-3 top-3 text-4xl opacity-70">{r.emoji}</span>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 rounded-full border-2 border-white">
                    <AvatarFallback className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full`}>
                      {r.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white drop-shadow">
                    <p className="text-xs uppercase tracking-wide opacity-90">{r.cuisine}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#111827] truncate">{r.name}</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5 truncate">{r.owner}</p>
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {r.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-[#9CA3AF]">
                  {r.city && (
                    <p className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" /> {r.city}
                    </p>
                  )}
                  <p className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {r.openTime} – {r.closeTime}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center pt-3 border-t border-[#F3F4F6]">
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{r.orderCount.toLocaleString()}</p>
                    <p className="text-[10px] text-[#9CA3AF]">Orders</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">${(r.balance / 1000).toFixed(1)}k</p>
                    <p className="text-[10px] text-[#9CA3AF]">Balance</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
                  <StatusBadge status={r.isActive ? "Active" : "Inactive"} />
                  <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
                    <span className="inline-flex items-center gap-0.5">
                      <Package className="w-3 h-3" />
                      {r.productCount} items
                    </span>
                    <button onClick={() => toast.info(`Opening ${r.name} settings`)} className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </ContentCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
