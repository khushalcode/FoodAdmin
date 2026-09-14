"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFetchOnce, timeAgo } from "../use-vendor-data";
import type { AuthVendor } from "../../login-page";

interface VendorOrdersProps {
  vendor: AuthVendor | null;
}

interface Order {
  id: string;
  code: string;
  customer: string;
  items: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  time: string;
  payment?: string;
}

const COLORS = ["from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-violet-500 to-purple-600", "from-amber-500 to-orange-600", "from-rose-500 to-pink-600", "from-cyan-500 to-blue-600"];

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

export default function VendorOrders({ vendor }: VendorOrdersProps) {
  const url = vendor ? `/api/vendor/orders?vendorId=${vendor.id}` : null;
  const { data: orders, loading, forceRefresh } = useFetchOnce<Order[]>(url);

  if (loading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 w-full rounded-lg bg-[#F3F4F6] animate-pulse" />
        ))}
      </div>
    );
  }

  const data: Order[] = (orders || []).map((o) => ({
    ...o,
    status: normalizeStatus(o.status),
    payment: o.paymentMethod,
  }));

  return (
    <ListTable<Order>
      title="Orders"
      description="All orders from your store"
      data={data}
      searchKeys={["code", "customer", "payment"] as (keyof Order)[]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Pending", value: "pending", match: (r) => r.status === "Pending" },
        { label: "Preparing", value: "preparing", match: (r) => r.status === "Preparing" },
        { label: "On the way", value: "ontheway", match: (r) => r.status === "On the way" },
        { label: "Delivered", value: "delivered", match: (r) => r.status === "Delivered" },
        { label: "Cancelled", value: "cancelled", match: (r) => r.status === "Cancelled" },
      ]}
      actionLabel="Refresh"
      onAction={() => {
        forceRefresh();
        toast.success("Orders refreshed");
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
                <p className="font-medium text-[#111827]">{r.customer}</p>
                <p className="text-xs text-[#9CA3AF] capitalize">{r.paymentMethod}</p>
              </div>
            </div>
          ),
        },
        { key: "items", header: "Items", align: "right", render: (r) => <span className="text-[#4B5563]">{r.items} pcs</span> },
        { key: "total", header: "Total", align: "right", render: (r) => <span className="font-semibold text-[#111827]">${r.total.toFixed(2)}</span> },
        { key: "status", header: "Status" },
        { key: "time", header: "Time", align: "right", render: (r) => <span className="text-xs text-[#9CA3AF]">{timeAgo(r.time)}</span> },
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
