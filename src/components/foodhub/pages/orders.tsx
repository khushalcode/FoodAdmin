"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  id: string;
  code: string;
  customer: string;
  customerEmail?: string;
  vendor: string;
  deliveryMan?: string;
  items: number;
  total: number;
  status: string;
  payment: string;
  paymentStatus: string;
  time: string;
}

const COLORS = ["from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-violet-500 to-purple-600", "from-amber-500 to-orange-600", "from-rose-500 to-pink-600", "from-cyan-500 to-blue-600"];

const FALLBACK: Order[] = [
  { id: "fb-1", code: "#ORD-2841", customer: "Olivia Martin", vendor: "Bella Italia", items: 3, total: 42.5, status: "Pending", payment: "Card", paymentStatus: "paid", time: "2 min ago" },
  { id: "fb-2", code: "#ORD-2840", customer: "Liam Chen", vendor: "Sushi Express", items: 2, total: 28.99, status: "Preparing", payment: "Wallet", paymentStatus: "paid", time: "8 min ago" },
  { id: "fb-3", code: "#ORD-2839", customer: "Sophia Patel", vendor: "Tandoori House", items: 5, total: 67.45, status: "On the way", payment: "Card", paymentStatus: "paid", time: "15 min ago" },
];

function normalizeStatus(s: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    confirmed: "Preparing",
    preparing: "Preparing",
    handover: "On the way",
    picked_up: "On the way",
    delivered: "Delivered",
    canceled: "Cancelled",
  };
  return map[s] || s.charAt(0).toUpperCase() + s.slice(1);
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
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

export default function OrdersPage() {
  const [data, setData] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const mapped: Order[] = (json || []).map((o: any) => ({
          id: o.id,
          code: o.code,
          customer: o.customer,
          customerEmail: o.customerEmail,
          vendor: o.vendor,
          deliveryMan: o.deliveryMan,
          items: o.items,
          total: o.total,
          status: normalizeStatus(o.status),
          payment: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          time: timeAgo(o.time),
        }));
        setData(mapped);
      } catch (e) {
        if (!cancelled) {
          setData(FALLBACK);
          toast.error("Failed to load orders — showing sample data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    <ListTable<Order>
      title="Orders"
      description="All customer orders across restaurants"
      data={rows}
      searchKeys={["code", "customer", "vendor"] as (keyof Order)[]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Pending", value: "pending", match: (r) => r.status === "Pending" },
        { label: "Preparing", value: "preparing", match: (r) => r.status === "Preparing" },
        { label: "On the way", value: "ontheway", match: (r) => r.status === "On the way" },
        { label: "Delivered", value: "delivered", match: (r) => r.status === "Delivered" },
        { label: "Cancelled", value: "cancelled", match: (r) => r.status === "Cancelled" },
      ]}
      actionLabel="Create Order"
      onAction={() => toast.success("Opening new order form...")}
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
                <p className="font-medium text-[#111827]">{r.customer}</p>
                <p className="text-xs text-[#9CA3AF] capitalize">{r.payment}</p>
              </div>
            </div>
          ),
        },
        { key: "vendor", header: "Restaurant" },
        { key: "items", header: "Items", align: "right", render: (r) => <span className="text-[#4B5563]">{r.items} pcs</span> },
        { key: "total", header: "Total", align: "right", render: (r) => <span className="font-semibold text-[#111827]">${r.total.toFixed(2)}</span> },
        { key: "status", header: "Status" },
        { key: "time", header: "Time", align: "right", render: (r) => <span className="text-xs text-[#9CA3AF]">{r.time}</span> },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.code}`)}
              onEdit={() => toast.info(`Updating ${r.code} status`)}
              onDelete={() => toast.error(`Cancelling ${r.code}`)}
            />
          ),
        },
      ]}
    />
  );
}
