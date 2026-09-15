"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Users, RefreshCw, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DeliveryMan {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string | null;
  active: boolean;
  status: string | null;
  type: string | null;
  zoneId: string | null;
  currentOrders: number;
  isDelivery: boolean;
  isRide: boolean;
}

const FALLBACK_DM: DeliveryMan[] = [
  { id: "1", name: "James Wilson", email: "james@delivery.com", phone: "+1 555-0201", image: null, active: true, status: "online", type: "parcel", zoneId: "1", currentOrders: 3, isDelivery: true, isRide: false },
  { id: "2", name: "Linda Chen", email: "linda@delivery.com", phone: "+1 555-0202", image: null, active: true, status: "online", type: "parcel", zoneId: "2", currentOrders: 1, isDelivery: true, isRide: false },
  { id: "3", name: "Robert Brown", email: "robert@delivery.com", phone: "+1 555-0203", image: null, active: true, status: "busy", type: "parcel", zoneId: "1", currentOrders: 5, isDelivery: true, isRide: false },
  { id: "4", name: "Emily Davis", email: "emily@delivery.com", phone: "+1 555-0204", image: null, active: false, status: "offline", type: "parcel", zoneId: "3", currentOrders: 0, isDelivery: true, isRide: false },
];

export default function ParcelDispatchPage() {
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDMs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/delivery-men", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.items ?? []);
      const mapped: DeliveryMan[] = arr.map((d: any) => ({
        id: String(d.id),
        name: d.name ?? "Delivery Boy",
        email: d.email ?? "",
        phone: d.phone ?? "",
        image: d.image ?? null,
        active: !!d.active,
        status: d.status ?? null,
        type: d.type ?? null,
        zoneId: d.zoneId ? String(d.zoneId) : null,
        currentOrders: Number(d.currentOrders || 0),
        isDelivery: !!d.isDelivery,
        isRide: !!d.isRide,
      }));
      // Filter parcel delivery men.
      const parcelDMs = mapped.filter((d) => (d.type || "").toLowerCase() === "parcel" || d.isDelivery);
      setDeliveryMen(parcelDMs.length > 0 ? parcelDMs : FALLBACK_DM);
    } catch {
      setDeliveryMen(FALLBACK_DM);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDMs();
  }, []);

  const visible = deliveryMen || [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parcel Dispatch</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Active delivery men available for parcel dispatch and their current order load.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDMs}
          className="h-9 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft overflow-hidden">
        <CardContent className="px-0">
          {loading ? (
            <div className="p-5 space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-amber-700 mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No delivery men available</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                There are no delivery men currently available for parcel dispatch. Add delivery men from the Delivery Boys page.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visible.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="p-4 hover:bg-muted/30 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center text-white font-semibold shrink-0">
                    {d.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground truncate">{d.name}</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                          d.status === "online"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : d.status === "busy"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {d.status || "offline"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{d.email || "—"}</span>
                      <span>{d.phone}</span>
                      {d.zoneId && (
                        <span className="inline-flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> Zone {d.zoneId}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">{d.currentOrders}</p>
                    <p className="text-xs text-muted-foreground">active orders</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                    onClick={() => toast.info(`Dispatching next parcel to ${d.name}`)}
                    disabled={d.status !== "online" || d.currentOrders >= 5}
                  >
                    Dispatch
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
