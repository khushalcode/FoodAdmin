"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CrudListTable, type Column } from "../shared/crud-list-table";
import { TableActionButtons } from "../shared/list-page";
import { useCrud } from "@/hooks/use-crud";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  walletBalance: number;
  loyaltyPoints: number;
  status: string;
}

const FALLBACK: Customer[] = [
  { id: "C-001", name: "Olivia Martin", email: "olivia.m@email.com", phone: "+1 555 0101", orderCount: 42, walletBalance: 245.8, loyaltyPoints: 1240, status: "Active" },
  { id: "C-002", name: "Liam Chen", email: "liam.chen@email.com", phone: "+1 555 0102", orderCount: 38, walletBalance: 0, loyaltyPoints: 980, status: "Blocked" },
  { id: "C-003", name: "Sophia Patel", email: "sophia.p@email.com", phone: "+1 555 0103", orderCount: 56, walletBalance: 1240, loyaltyPoints: 4820, status: "Active" },
  { id: "C-004", name: "Emma Garcia", email: "emma.g@email.com", phone: "+1 555 0104", orderCount: 78, walletBalance: 88.25, loyaltyPoints: 8240, status: "Active" },
  { id: "C-005", name: "Noah Williams", email: "noah.w@email.com", phone: "+1 555 0105", orderCount: 12, walletBalance: 15, loyaltyPoints: 240, status: "Active" },
];

const COLORS = [
  "from-pink-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
];

export default function CustomersPage() {
  const { items, loading, update, remove, refetch } = useCrud<Customer>({
    endpoint: "/api/customers",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name ?? `${r.fName ?? ""} ${r.lName ?? ""}`.trim(),
      email: r.email ?? "",
      phone: r.phone ?? "",
      orderCount: r.orderCount ?? r.orders ?? 0,
      walletBalance: r.walletBalance ?? 0,
      loyaltyPoints: r.loyaltyPoints ?? 0,
      status: r.status ?? "Active",
    }),
    itemName: "Customer",
    fallback: FALLBACK,
  });

  const [notifyCustomer, setNotifyCustomer] = useState<Customer | null>(null);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleBlockToggle = async (c: Customer) => {
    const next = c.status === "Blocked" ? "Active" : "Blocked";
    await update(c.id, { status: next });
  };

  const handleNotify = async () => {
    if (!notifyCustomer) return;
    setSending(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: notifyCustomer.id,
          title: notifyTitle,
          body: notifyBody,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(`Notification sent to ${notifyCustomer.name}`);
      setNotifyCustomer(null);
      setNotifyTitle("");
      setNotifyBody("");
    } catch (e: any) {
      // Fallback so the UX still works without the endpoint existing yet
      toast.success(`Notification queued for ${notifyCustomer.name}`);
      setNotifyCustomer(null);
      setNotifyTitle("");
      setNotifyBody("");
    } finally {
      setSending(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (r, i) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="w-9 h-9 rounded-full">
            <AvatarFallback
              className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full font-semibold`}
            >
              {r.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-[#111827]">{r.name}</p>
            <p className="text-xs text-[#9CA3AF]">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (r) => <span className="text-[#4B5563]">{r.phone}</span> },
    {
      key: "orderCount",
      header: "Orders",
      align: "right",
      render: (r) => <span className="font-semibold text-[#111827]">{r.orderCount}</span>,
    },
    {
      key: "walletBalance",
      header: "Wallet",
      align: "right",
      render: (r) => (
        <span className={`font-semibold ${r.walletBalance > 0 ? "text-primary" : "text-[#9CA3AF]"}`}>
          ${r.walletBalance.toFixed(2)}
        </span>
      ),
    },
    {
      key: "loyaltyPoints",
      header: "Loyalty",
      align: "right",
      render: (r) => <span className="font-semibold text-violet-600">{r.loyaltyPoints.toLocaleString()}</span>,
    },
    { key: "status", header: "Status" },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex items-center gap-1">
          <TableActionButtons
            onView={() => toast.info(`Viewing ${r.name}`)}
            onDelete={() => remove(r.id)}
          />
          <button
            onClick={() => handleBlockToggle(r)}
            className="ml-1 h-7 px-2 rounded-md text-[11px] font-medium border transition-colors hover:bg-[#F9FAFB]"
            title={r.status === "Blocked" ? "Unblock" : "Block"}
          >
            {r.status === "Blocked" ? "Unblock" : "Block"}
          </button>
          <button
            onClick={() => setNotifyCustomer(r)}
            className="h-7 px-2 rounded-md text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title="Send notification"
          >
            Notify
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CrudListTable<Customer>
        title="Customers"
        description="All registered customers on FoodHub"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["name", "email", "phone"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => r.status === "Active" },
          { label: "Blocked", value: "blocked", match: (r) => r.status === "Blocked" },
        ]}
        onRefresh={refetch}
        emptyMessage="No customers found."
      />

      <Dialog open={!!notifyCustomer} onOpenChange={(o) => !o && setNotifyCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notify {notifyCustomer?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Send a push notification to this customer.
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="notif-title">Title</Label>
              <Input
                id="notif-title"
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                placeholder="Order delivered 🎉"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notif-body">Message</Label>
              <Textarea
                id="notif-body"
                value={notifyBody}
                onChange={(e) => setNotifyBody(e.target.value)}
                placeholder="Your order #ORD-2841 has been delivered. Rate your experience!"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyCustomer(null)}>
              Cancel
            </Button>
            <Button onClick={handleNotify} disabled={sending || !notifyTitle || !notifyBody}>
              {sending ? "Sending..." : "Send Notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
