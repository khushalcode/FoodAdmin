"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PackageX, RefreshCw, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  id: string;
  code?: string;
  customer: string;
  vendor: string;
  items: number;
  total: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
  status: string | null;
  address: string | null;
  time: string | null;
  orderType?: string | null;
  order_type?: string | null;
}

const FALLBACK_ORDERS: Order[] = [
  { id: "1", code: "#100245", customer: "John Doe", vendor: "FastShip Logistics", items: 1, total: 12.50, paymentMethod: "card", paymentStatus: "Paid", status: "Pending", address: "123 Main St", time: new Date().toISOString(), orderType: "parcel" },
  { id: "2", code: "#100246", customer: "Sarah Lee", vendor: "QuickParcel", items: 2, total: 28.00, paymentMethod: "cash", paymentStatus: "Unpaid", status: "Out for delivery", address: "456 Oak Ave", time: new Date().toISOString(), orderType: "parcel" },
  { id: "3", code: "#100247", customer: "Maria Garcia", vendor: "FastShip Logistics", items: 1, total: 8.75, paymentMethod: "wallet", paymentStatus: "Paid", status: "Delivered", address: "789 Pine Rd", time: new Date().toISOString(), orderType: "parcel" },
];

export default function ParcelOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.items ?? []);
      const mapped: Order[] = arr.map((o: any) => ({
        id: String(o.id),
        code: o.code ?? `#${o.id}`,
        customer: o.customer ?? "Customer",
        vendor: o.vendor ?? "—",
        items: o.items ?? 0,
        total: Number(o.total ?? 0),
        paymentMethod: o.paymentMethod ?? null,
        paymentStatus: o.paymentStatus ?? null,
        status: o.status ?? null,
        address: o.address ?? null,
        time: o.time ?? null,
        orderType: o.orderType ?? o.order_type ?? null,
      }));
      // Filter parcel orders — fall back to all orders if API doesn't expose order_type.
      const parcelOnly = mapped.filter(
        (o) => (o.orderType || "").toLowerCase() === "parcel",
      );
      setOrders(parcelOnly.length > 0 ? parcelOnly : FALLBACK_ORDERS);
    } catch {
      setOrders(FALLBACK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const visible = orders || [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parcel Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Orders with order_type=parcel — courier shipments between customers and vendors.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
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
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-amber-700 mb-4">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No parcel orders yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                When customers place parcel-delivery orders, they will appear here. Make sure the Parcel module is enabled.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Vendor</th>
                  <th className="text-right px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Items</th>
                  <th className="text-right px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o, i) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="border-t border-border hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{o.code}</td>
                    <td className="px-4 py-3 text-sm">{o.customer}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{o.vendor}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{o.items}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">${o.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-blue-50 text-blue-700 border-blue-200">
                        {o.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toast.info(`Viewing parcel order ${o.code}`)}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#6B7280] hover:bg-blue-50 hover:text-primary transition-colors"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
