"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { CrudListTable, type Column } from "../shared/crud-list-table";
import { TableActionButtons } from "../shared/list-page";
import { useCrud } from "@/hooks/use-crud";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PosOrder {
  id: string;
  code: string;
  customer: string;
  vendor: string;
  deliveryMan?: string;
  items: number;
  total: number;
  subtotal?: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  address: any;
  time: string;
}

const FALLBACK: PosOrder[] = [
  {
    id: "1",
    code: "#POS-2401",
    customer: "Walk-in",
    vendor: "Bella Italia",
    items: 3,
    total: 42.5,
    paymentMethod: "card",
    paymentStatus: "paid",
    status: "delivered",
    address: null,
    time: "2025-11-21T10:24:00Z",
  },
  {
    id: "2",
    code: "#POS-2402",
    customer: "Walk-in",
    vendor: "Burger Bros",
    items: 2,
    total: 18.75,
    paymentMethod: "cash_on_delivery",
    paymentStatus: "paid",
    status: "delivered",
    address: null,
    time: "2025-11-21T10:48:00Z",
  },
  {
    id: "3",
    code: "#POS-2403",
    customer: "Walk-in",
    vendor: "Sushi Express",
    items: 5,
    total: 67.2,
    paymentMethod: "wallet",
    paymentStatus: "paid",
    status: "pending",
    address: null,
    time: "2025-11-21T11:15:00Z",
  },
  {
    id: "4",
    code: "#POS-2404",
    customer: "Walk-in",
    vendor: "Green Bowl",
    items: 1,
    total: 12.99,
    paymentMethod: "card",
    paymentStatus: "paid",
    status: "confirmed",
    address: null,
    time: "2025-11-21T11:34:00Z",
  },
  {
    id: "5",
    code: "#POS-2405",
    customer: "Walk-in",
    vendor: "Dragon Wok",
    items: 4,
    total: 31.4,
    paymentMethod: "card",
    paymentStatus: "paid",
    status: "processing",
    address: null,
    time: "2025-11-21T12:02:00Z",
  },
];

const STATUS_FLOW: { value: string; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "handover", label: "Ready for handover" },
  { value: "picked_up", label: "Picked up" },
  { value: "delivered", label: "Delivered" },
  { value: "canceled", label: "Cancel order" },
];

const STATUS_CLS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  handover: "bg-violet-50 text-violet-700 border-violet-200",
  picked_up: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  canceled: "bg-red-50 text-red-700 border-red-200",
};

function fmtTime(s: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtPayment(m: string) {
  return (m || "")
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export default function PosOrdersPage() {
  const { items, loading, refetch, setItems } = useCrud<PosOrder>({
    endpoint: "/api/orders",
    realtimeTable: "orders",
    itemName: "POS Order",
    fallback: FALLBACK,
  });

  const [viewing, setViewing] = useState<PosOrder | null>(null);
  const [advancing, setAdvancing] = useState<PosOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [advancingBusy, setAdvancingBusy] = useState(false);

  const advanceStatus = async () => {
    if (!advancing || !newStatus) return;
    setAdvancingBusy(true);
    try {
      const res = await fetch("/api/orders-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: advancing.id, status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      toast.success(`Order ${advancing.code} → ${newStatus}`);
      // Optimistic local update so the UI refreshes immediately
      setItems((cur) =>
        (cur || []).map((o) =>
          o.id === advancing.id ? { ...o, status: newStatus } : o,
        ),
      );
      setAdvancing(null);
      setNewStatus("");
      refetch();
    } catch (e: any) {
      toast.error(`Failed to update status: ${e.message}`);
    } finally {
      setAdvancingBusy(false);
    }
  };

  const columns: Column<PosOrder>[] = [
    {
      key: "code",
      header: "Order #",
      render: (r) => <span className="font-semibold text-primary">{r.code || `#${r.id}`}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (r) => (
        <div>
          <p className="font-medium text-foreground">{r.customer || "Walk-in"}</p>
          <p className="text-[11px] text-muted-foreground">{r.vendor}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      align: "right",
      render: (r) => <span className="text-muted-foreground">{r.items}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (r) => <span className="font-semibold text-foreground">${Number(r.total).toFixed(2)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const label = r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "—";
        const cls = STATUS_CLS[r.status] || "bg-gray-100 text-gray-600 border-gray-200";
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${cls}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {label}
          </span>
        );
      },
    },
    {
      key: "time",
      header: "Time",
      align: "right",
      render: (r) => <span className="text-xs text-muted-foreground">{fmtTime(r.time)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButtons
            onView={() => setViewing(r)}
            onEdit={() => {
              setAdvancing(r);
              setNewStatus(r.status || "confirmed");
            }}
          />
          <button
            onClick={() => {
              setAdvancing(r);
              setNewStatus(r.status || "confirmed");
            }}
            className="ml-1 inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[11px] font-medium text-primary bg-blue-50 hover:bg-blue-100 transition-colors"
            title="Advance status"
          >
            Advance <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CrudListTable<PosOrder>
        title="POS Orders"
        description="Recent in-store orders placed via the Point of Sale"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["code", "customer", "vendor"]}
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Pending", value: "pending", match: (r) => r.status === "pending" },
          { label: "Confirmed", value: "confirmed", match: (r) => r.status === "confirmed" },
          { label: "Processing", value: "processing", match: (r) => r.status === "processing" },
          { label: "Delivered", value: "delivered", match: (r) => r.status === "delivered" },
          { label: "Canceled", value: "canceled", match: (r) => r.status === "canceled" },
        ]}
        onRefresh={refetch}
        realtimeStatus="subscribed"
        emptyMessage="No POS orders yet. Create one from the Point of Sale tab."
      />

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order {viewing?.code || `#${viewing?.id}`}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <Row label="Customer" value={viewing.customer || "Walk-in"} />
              <Row label="Vendor" value={viewing.vendor || "—"} />
              {viewing.deliveryMan && <Row label="Delivery Man" value={viewing.deliveryMan} />}
              <Row label="Items" value={String(viewing.items)} />
              <Row label="Total" value={`$${Number(viewing.total).toFixed(2)}`} />
              <Row label="Payment" value={fmtPayment(viewing.paymentMethod)} />
              <Row label="Payment Status" value={viewing.paymentStatus} />
              <Row label="Order Status" value={viewing.status} />
              <Row label="Placed" value={fmtTime(viewing.time)} />
              {viewing.address && (
                <Row
                  label="Address"
                  value={
                    typeof viewing.address === "string"
                      ? viewing.address
                      : JSON.stringify(viewing.address)
                  }
                />
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advance status dialog */}
      <Dialog open={!!advancing} onOpenChange={(o) => !o && setAdvancing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Advance Order {advancing?.code || `#${advancing?.id}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Current status:{" "}
              <span className="font-medium text-foreground capitalize">{advancing?.status}</span>
            </p>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Choose next status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FLOW.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdvancing(null)}>
              Cancel
            </Button>
            <Button onClick={advanceStatus} disabled={!newStatus || advancingBusy}>
              {advancingBusy ? "Updating…" : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
