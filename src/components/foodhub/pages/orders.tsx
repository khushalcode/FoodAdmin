"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRealtimeTable } from "@/hooks/use-realtime";

interface Order {
  id: string;
  code: string;
  customer: string;
  customerEmail?: string;
  vendor: string;
  deliveryMan?: string;
  items: number;
  total: number;
  subtotal: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  address?: string;
  time: string;
}

const COLORS = [
  "from-violet-500 to-fuchsia-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-500 to-blue-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-purple-600",
];

const FALLBACK: Order[] = [
  { id: "fb-1", code: "#ORD-2841", customer: "Olivia Martin", vendor: "Bella Italia", items: 3, total: 42.5, subtotal: 42.5, status: "pending", paymentMethod: "card", paymentStatus: "paid", time: "2 min ago" },
  { id: "fb-2", code: "#ORD-2840", customer: "Liam Chen", vendor: "Sushi Express", items: 2, total: 28.99, subtotal: 28.99, status: "confirmed", paymentMethod: "wallet", paymentStatus: "paid", time: "8 min ago" },
  { id: "fb-3", code: "#ORD-2839", customer: "Sophia Patel", vendor: "Tandoori House", items: 5, total: 67.45, subtotal: 67.45, status: "handover", paymentMethod: "card", paymentStatus: "paid", time: "15 min ago" },
];

function normalizeStatus(s: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    confirmed: "Preparing",
    preparing: "Preparing",
    processing: "Preparing",
    handover: "Ready",
    picked_up: "On the way",
    delivered: "Delivered",
    canceled: "Cancelled",
  };
  return map[s] || s.charAt(0).toUpperCase() + s.slice(1);
}

function timeAgo(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "handover",
  handover: "picked_up",
  picked_up: "delivered",
};

export default function OrdersPage() {
  const [data, setData] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deliveryMen, setDeliveryMen] = useState<{ id: string; name: string }[]>([]);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const mapped: Order[] = (json || []).map((o: any) => ({
        id: o.id,
        code: o.code,
        customer: o.customer,
        customerEmail: o.customerEmail,
        vendor: o.vendor,
        deliveryMan: o.deliveryMan,
        items: o.items,
        total: o.total,
        subtotal: o.subtotal || o.total,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        address: o.address,
        time: timeAgo(o.time),
      }));
      setData(mapped);
    } catch (e) {
      setData(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Load delivery men for assignment
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/delivery-men", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          setDeliveryMen((json || []).map((d: any) => ({ id: d.id, name: d.name })));
        }
      } catch {}
    })();
  }, []);

  // Live updates — subscribe to orders table changes (any INSERT or UPDATE triggers refetch)
  const { status: rtStatus } = useRealtimeTable("orders", () => {
    refetch();
  }, { event: "*" });

  const updateOrderStatus = async (orderId: string, status: string, deliveryManId?: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/orders-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, deliveryManId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      toast.success(`Order #${orderId} → ${status}`);
      await refetch();
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const rows = data || FALLBACK;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          {rows.length} orders ·{" "}
          <span className={rtStatus === "subscribed" ? "text-emerald-600 font-medium" : "text-amber-600"}>
            realtime: {rtStatus}
          </span>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
        >
          Refresh
        </Button>
      </div>

      <ListTable<Order>
        title="Orders"
        description="All customer orders — status updates fire realtime events to customer + delivery apps"
        data={rows}
        searchKeys={["code", "customer", "vendor"] as (keyof Order)[]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Pending", value: "pending", match: (r) => r.status === "pending" },
          { label: "Preparing", value: "preparing", match: (r) => ["confirmed", "processing"].includes(r.status) },
          { label: "Ready", value: "ready", match: (r) => r.status === "handover" },
          { label: "On the way", value: "ontheway", match: (r) => r.status === "picked_up" },
          { label: "Delivered", value: "delivered", match: (r) => r.status === "delivered" },
          { label: "Cancelled", value: "cancelled", match: (r) => r.status === "canceled" },
        ]}
        actionLabel="Create Order"
        onAction={() => {
          window.location.hash = "create-order";
        }}
        columns={[
          { key: "code", header: "Order ID", render: (r) => <span className="font-semibold text-primary">{r.code}</span> },
          {
            key: "customer",
            header: "Customer",
            render: (r, i) => (
              <div className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8 rounded-full">
                  <AvatarFallback className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full`}>
                    {r.customer.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{r.customer}</p>
                  <p className="text-xs text-muted-foreground capitalize">{r.paymentMethod}</p>
                </div>
              </div>
            ),
          },
          { key: "vendor", header: "Restaurant" },
          { key: "items", header: "Items", align: "right", render: (r) => <span className="text-muted-foreground">{r.items} pcs</span> },
          { key: "total", header: "Total", align: "right", render: (r) => <span className="font-semibold text-foreground">${r.total.toFixed(2)}</span> },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Badge variant="outline" className="capitalize border-primary/30 text-primary bg-primary/5">
                {normalizeStatus(r.status)}
              </Badge>
            ),
          },
          { key: "time", header: "Time", align: "right", render: (r) => <span className="text-xs text-muted-foreground">{r.time}</span> },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (r) => {
              const next = NEXT_STATUS[r.status];
              const isFinal = !next;
              return (
                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                  {!isFinal && (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={updating === r.id}
                      onClick={() => updateOrderStatus(r.id, next)}
                      className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 h-7 text-xs"
                    >
                      {updating === r.id ? "…" : `→ ${normalizeStatus(next)}`}
                    </Button>
                  )}
                  {r.status === "picked_up" && (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={updating === r.id}
                      onClick={() => updateOrderStatus(r.id, "delivered")}
                      className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 h-7 text-xs"
                    >
                      Deliver
                    </Button>
                  )}
                  {!isFinal && r.status !== "canceled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updating === r.id}
                      onClick={() => updateOrderStatus(r.id, "canceled", undefined)}
                      className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                  <TableActionButtons
                    onView={() => toast.info(`Viewing ${r.code}`)}
                    onEdit={() => {
                      const dmId = prompt(`Assign delivery man (DM ID, optional).\n\nAvailable: ${deliveryMen.map(d => `${d.id}=${d.name}`).join(", ") || "none loaded"}`);
                      if (dmId !== null) updateOrderStatus(r.id, r.status === "pending" ? "confirmed" : r.status, dmId || undefined);
                    }}
                    onDelete={() => updateOrderStatus(r.id, "canceled")}
                  />
                </div>
              );
            },
          },
        ]}
      />
    </div>
  );
}
