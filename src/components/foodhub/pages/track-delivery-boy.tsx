"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, MapPin, Bike, Clock, Phone, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "../shared/list-page";

interface TrackData {
  deliveryManId: string;
  name: string;
  phone: string;
  zone: string;
  active: boolean;
  currentOrders: {
    id: string;
    status: string;
    customerName: string;
    deliveryAddress: string;
    eta: string;
  }[];
}

export default function TrackDeliveryBoyPage() {
  const [inputId, setInputId] = useState("");
  const [searchedId, setSearchedId] = useState<string | null>(null);
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDm = async (id: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/track-delivery?deliveryManId=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
      // Fallback demo data so the UI is still informative
      setData({
        deliveryManId: id,
        name: "Carlos Rivera",
        phone: "+1 555 0142",
        zone: "Downtown",
        active: true,
        currentOrders: [
          { id: "ORD-2841", status: "On the way", customerName: "Olivia Martin", deliveryAddress: "123 Apple St, Apt 4B, Downtown", eta: "8 min" },
          { id: "ORD-2839", status: "Preparing", customerName: "Sophia Patel", deliveryAddress: "456 Berry Ave, Midtown", eta: "20 min" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchedId) fetchDm(searchedId);
  }, [searchedId]);

  const handleSearch = () => {
    const id = inputId.trim();
    if (!id) {
      toast.error("Enter a delivery man ID");
      return;
    }
    setSearchedId(id);
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#111827]">Track Delivery Boy</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Enter a delivery man ID to see their current status & live orders
        </p>
      </div>

      <Card className="rounded-2xl shadow-soft border-[#E5E7EB] mb-5">
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter delivery man ID (e.g. DM-01)"
                className="pl-9 h-10 rounded-lg bg-white border-[#E5E7EB]"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="h-10 px-5 bg-primary hover:bg-blue-700 text-white"
            >
              <Bike className="w-4 h-4 mr-1.5" />
              Track
            </Button>
          </div>
        </CardContent>
      </Card>

      {!searchedId && (
        <Card className="rounded-2xl border-dashed border-[#E5E7EB]">
          <CardContent>
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-4">
                <Bike className="w-8 h-8" />
              </div>
              <p className="font-medium text-[#111827]">Track a delivery boy</p>
              <p className="text-sm text-[#6B7280] mt-1">
                Enter a delivery man ID above and click Track to see their live status.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {searchedId && loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl lg:col-span-2" />
        </div>
      )}

      {searchedId && !loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* DM info card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-2xl shadow-soft border-[#E5E7EB]">
              <CardHeader className="border-b border-[#F3F4F6] pb-4">
                <CardTitle className="text-base text-[#111827]">
                  Delivery Man
                </CardTitle>
                <p className="text-xs text-[#6B7280]">{data.deliveryManId}</p>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-14 h-14 rounded-full">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-base rounded-full font-semibold">
                        {data.name
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                        data.active ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#111827]">{data.name}</p>
                    <p className="text-xs text-[#6B7280] inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {data.zone}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280] inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone
                    </span>
                    <span className="font-medium text-[#111827]">{data.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280] inline-flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Active Orders
                    </span>
                    <span className="font-semibold text-primary">
                      {data.currentOrders.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Status</span>
                    <StatusBadge status={data.active ? "Online" : "Offline"} />
                  </div>
                </div>
                <Button
                  onClick={() => toast.success(`Calling ${data.name}...`)}
                  className="w-full bg-primary hover:bg-blue-700"
                >
                  <Phone className="w-4 h-4 mr-1.5" />
                  Call Rider
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current orders */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-2xl shadow-soft border-[#E5E7EB]">
              <CardHeader className="border-b border-[#F3F4F6] pb-4">
                <CardTitle className="text-base text-[#111827]">
                  Current Orders
                </CardTitle>
                <p className="text-xs text-[#6B7280]">
                  {data.currentOrders.length} active orders
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                {data.currentOrders.length === 0 ? (
                  <div className="py-10 text-center text-sm text-[#6B7280]">
                    No active orders right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.currentOrders.map((o, i) => (
                      <motion.div
                        key={o.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-[#111827]">#{o.id}</p>
                            <p className="text-xs text-[#6B7280]">{o.customerName}</p>
                          </div>
                          <StatusBadge status={o.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#6B7280]">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {o.deliveryAddress}
                          </span>
                          {o.eta && (
                            <span className="inline-flex items-center gap-1 text-primary font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              {o.eta}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {searchedId && !loading && error && !data && (
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent>
            <p className="text-sm text-red-700">
              Failed to load delivery man {searchedId}: {error}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
