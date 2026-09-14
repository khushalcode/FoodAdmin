"use client";

import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, X, Building2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { PageHeader, ContentCard, useFakeLoading, GridSkeleton } from "../shared/list-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface App {
  id: number;
  restaurant: string;
  owner: string;
  email: string;
  phone: string;
  cuisine: string;
  city: string;
  applied: string;
  gradient: string;
}

const DATA: App[] = [
  { id: 1, restaurant: "Burger Kingdom", owner: "James Stone", email: "james@burgerkingdom.com", phone: "+1 555 0142", cuisine: "American", city: "New York", applied: "2 days ago", gradient: "from-amber-500 to-orange-600" },
  { id: 2, restaurant: "Sakura Ramen", owner: "Hana Sato", email: "hana@sakuraramen.jp", phone: "+81 90 1234 5678", cuisine: "Japanese", city: "Tokyo", applied: "3 days ago", gradient: "from-rose-500 to-pink-600" },
  { id: 3, restaurant: "Spice Route", owner: "Priya Patel", email: "priya@spiceroute.in", phone: "+91 98765 43210", cuisine: "Indian", city: "Mumbai", applied: "5 days ago", gradient: "from-orange-500 to-red-600" },
  { id: 4, restaurant: "La Petite Boulangerie", owner: "Camille Dubois", email: "camille@petiteboulangerie.fr", phone: "+33 6 12 34 56 78", cuisine: "French Bakery", city: "Paris", applied: "1 week ago", gradient: "from-violet-500 to-purple-600" },
  { id: 5, restaurant: "Taco Fiesta", owner: "Diego Hernandez", email: "diego@tacofiesta.mx", phone: "+52 55 1234 5678", cuisine: "Mexican", city: "Mexico City", applied: "1 week ago", gradient: "from-lime-500 to-green-600" },
  { id: 6, restaurant: "Green Fork", owner: "Emma Wilson", email: "emma@greenfork.com", phone: "+1 555 0987", cuisine: "Vegan", city: "San Francisco", applied: "2 weeks ago", gradient: "from-emerald-500 to-teal-600" },
];

export default function RestaurantApplicationsPage() {
  const loading = useFakeLoading();

  return (
    <div>
      <PageHeader
        title="Restaurant Applications"
        description="Pending partnership applications from restaurants"
        actionLabel="Export List"
        onAction={() => toast.success("Exporting applications...")}
      />
      {loading ? (
        <GridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DATA.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <ContentCard className="p-5 h-full">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="w-12 h-12 rounded-xl shrink-0">
                    <AvatarFallback className={`bg-gradient-to-br ${a.gradient} text-white rounded-xl font-bold`}>
                      <Building2 className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#111827]">{a.restaurant}</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">{a.owner} · {a.cuisine}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-semibold uppercase tracking-wide">
                      Pending · applied {a.applied}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
                  <div className="flex items-center gap-2 text-[#4B5563]">
                    <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span className="truncate">{a.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4B5563]">
                    <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>{a.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4B5563]">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>{a.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4B5563]">
                    <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>{a.applied}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-[#F3F4F6]">
                  <Button onClick={() => toast.success(`${a.restaurant} approved!`)} className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                    <Check className="w-4 h-4 mr-1.5" /> Approve
                  </Button>
                  <Button onClick={() => toast.error(`${a.restaurant} rejected`)} variant="outline" className="flex-1 h-9 rounded-lg border-[#E5E7EB] text-red-600 hover:bg-red-50 text-xs font-semibold">
                    <X className="w-4 h-4 mr-1.5" /> Reject
                  </Button>
                </div>
              </ContentCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
