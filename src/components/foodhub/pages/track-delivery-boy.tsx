"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MapPin, Bike, Clock, Phone, Navigation } from "lucide-react";
import { PageHeader, ContentCard, StatusBadge, useFakeLoading, ListSkeleton } from "../shared/list-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Rider {
  id: string;
  name: string;
  order: string;
  customer: string;
  eta: string;
  x: number; // percent
  y: number;
  status: string;
}

const RIDERS_INIT: Rider[] = [
  { id: "DM-01", name: "Carlos Rivera", order: "#ORD-2839", customer: "Sophia Patel", eta: "8 min", x: 30, y: 45, status: "On the way" },
  { id: "DM-02", name: "Aisha Khan", order: "#ORD-2841", customer: "Olivia Martin", eta: "12 min", x: 65, y: 25, status: "On the way" },
  { id: "DM-03", name: "Maria Santos", order: "#ORD-2836", customer: "Mason Brown", eta: "3 min", x: 50, y: 65, status: "Arriving" },
  { id: "DM-04", name: "Robert Chen", order: "#ORD-2840", customer: "Liam Chen", eta: "15 min", x: 75, y: 60, status: "On the way" },
];

const COLORS = ["from-orange-500 to-red-600", "from-violet-500 to-purple-600", "from-emerald-500 to-teal-600", "from-cyan-500 to-blue-600"];

export default function TrackDeliveryBoyPage() {
  const loading = useFakeLoading();
  const [riders, setRiders] = useState(RIDERS_INIT);
  const [selected, setSelected] = useState<string | null>(RIDERS_INIT[0].id);

  // Move riders every 2 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setRiders((prev) =>
        prev.map((r) => ({
          ...r,
          x: Math.max(8, Math.min(92, r.x + (Math.random() - 0.5) * 8)),
          y: Math.max(8, Math.min(88, r.y + (Math.random() - 0.5) * 8)),
          eta: `${Math.max(1, parseInt(r.eta) - (Math.random() > 0.5 ? 1 : 0))} min`,
        })),
      );
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const selectedRider = riders.find((r) => r.id === selected);

  return (
    <div>
      <PageHeader
        title="Track Delivery Boys"
        description="Real-time location of active delivery personnel"
        actionLabel="Refresh"
        onAction={() => toast.success("Refreshing tracking data...")}
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><ListSkeleton rows={1} /></div>
          <ListSkeleton rows={5} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map placeholder */}
          <ContentCard className="lg:col-span-2 overflow-hidden">
            <div className="relative h-[480px] bg-gradient-to-br from-[#E5E7EB] to-[#F3F4F6] overflow-hidden">
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }} />
              {/* Roads */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#FFFFFF" strokeWidth="6" />
                <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#FFFFFF" strokeWidth="6" />
                <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#FFFFFF" strokeWidth="6" />
                <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#FFFFFF" strokeWidth="6" />
              </svg>
              {/* Restaurants */}
              <div className="absolute" style={{ left: "10%", top: "10%" }}>
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm shadow-md">🏪</div>
              </div>
              <div className="absolute" style={{ left: "82%", top: "85%" }}>
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm shadow-md">🏪</div>
              </div>
              {/* Customers */}
              {riders.map((r) => (
                <div key={`c-${r.id}`} className="absolute" style={{ left: `${r.x}%`, top: `${r.y}%`, transform: "translate(60%, 60%)" }}>
                  <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-sm">🏠</div>
                </div>
              ))}
              {/* Riders (animated) */}
              <AnimatePresence>
                {riders.map((r, i) => (
                  <motion.button
                    key={r.id}
                    onClick={() => setSelected(r.id)}
                    className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform ${selected === r.id ? "scale-125" : "hover:scale-110"}`}
                    style={{ left: `${r.x}%`, top: `${r.y}%` }}
                    animate={{ left: `${r.x}%`, top: `${r.y}%` }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  >
                    <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white flex items-center justify-center shadow-lg ring-2 ring-white`}>
                      <Bike className="w-5 h-5" />
                      {selected === r.id && (
                        <motion.span
                          className="absolute -inset-1 rounded-full border-2 border-primary"
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
              {/* Map controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                <button className="w-8 h-8 rounded-lg bg-white shadow-md text-[#374151] hover:bg-[#F3F4F6] font-bold">+</button>
                <button className="w-8 h-8 rounded-lg bg-white shadow-md text-[#374151] hover:bg-[#F3F4F6] font-bold">−</button>
              </div>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-xs text-[#6B7280] font-medium shadow-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-primary" />
                  Live tracking · {riders.length} active riders
                </span>
              </div>
            </div>
          </ContentCard>

          {/* Active riders sidebar */}
          <ContentCard className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-base font-semibold text-[#111827]">Active Riders</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">{riders.length} delivering now</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              {riders.map((r, i) => (
                <motion.button
                  key={r.id}
                  onClick={() => setSelected(r.id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`w-full text-left p-4 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors ${selected === r.id ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 rounded-full">
                      <AvatarFallback className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full font-semibold`}>
                        {r.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#111827]">{r.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{r.order} · {r.customer}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-primary inline-flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {r.eta}
                      </p>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            {selectedRider && (
              <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Selected rider</p>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <p className="text-sm text-[#111827] font-medium">{selectedRider.name}</p>
                </div>
                <button
                  onClick={() => toast.success(`Calling ${selectedRider.name}...`)}
                  className="mt-3 w-full h-9 rounded-lg bg-primary hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Rider
                </button>
              </div>
            )}
          </ContentCard>
        </div>
      )}
    </div>
  );
}
