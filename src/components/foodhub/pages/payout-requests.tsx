"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, DollarSign, X, User, Bike } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PayoutRequest {
  id: string;
  type: "vendor" | "delivery_man";
  requesterName: string;
  requesterEmail: string;
  amount: number;
  status: string; // pending | approved | paid | rejected
  method: string | null;
  note: string | null;
  createdAt: string;
}

const FALLBACK: PayoutRequest[] = [
  {
    id: "fb-1",
    type: "vendor",
    requesterName: "Bella Italia",
    requesterEmail: "owner@bellaitalia.com",
    amount: 1240.5,
    status: "pending",
    method: "Bank Transfer",
    note: null,
    createdAt: "2025-11-21T10:00:00Z",
  },
  {
    id: "fb-2",
    type: "vendor",
    requesterName: "Sushi Express",
    requesterEmail: "admin@sushiexpress.com",
    amount: 890.25,
    status: "pending",
    method: "PayPal",
    note: null,
    createdAt: "2025-11-21T05:00:00Z",
  },
  {
    id: "fb-3",
    type: "delivery_man",
    requesterName: "Carlos Rivera",
    requesterEmail: "carlos@delivery.com",
    amount: 215.0,
    status: "approved",
    method: "Bank Transfer",
    note: null,
    createdAt: "2025-11-20T15:00:00Z",
  },
  {
    id: "fb-4",
    type: "vendor",
    requesterName: "Burger Bros",
    requesterEmail: "ops@burgerbros.com",
    amount: 670.8,
    status: "paid",
    method: "Stripe",
    note: "Wire sent — TXN-9385",
    createdAt: "2025-11-19T12:00:00Z",
  },
  {
    id: "fb-5",
    type: "delivery_man",
    requesterName: "Anna Wu",
    requesterEmail: "anna@delivery.com",
    amount: 312.45,
    status: "rejected",
    method: "PayPal",
    note: "Duplicate request",
    createdAt: "2025-11-18T09:00:00Z",
  },
];

const STATUS_CLS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const COLORS = [
  "from-red-500 to-orange-600",
  "from-blue-500 to-cyan-600",
  "from-amber-500 to-orange-600",
  "from-yellow-500 to-amber-600",
  "from-green-500 to-emerald-600",
  "from-orange-500 to-red-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
];

function fmtDate(s: string) {
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

type Action = "approved" | "paid" | "rejected";

export default function PayoutRequestsPage() {
  const { items, loading, refetch, setItems } = useCrud<PayoutRequest>({
    endpoint: "/api/payout-requests",
    realtimeTable: "withdraw_requests",
    itemName: "Payout Request",
    fallback: FALLBACK,
  });

  const [confirm, setConfirm] = useState<{ req: PayoutRequest; action: Action } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const applyAction = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      // useCrud's update endpoint would send { id, status, userNote } which matches this API
      const res = await fetch("/api/payout-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: confirm.req.id,
          status: confirm.action,
          userNote: note || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      toast.success(`Request marked as ${confirm.action}`);
      setItems((cur) =>
        (cur || []).map((r) =>
          r.id === confirm.req.id ? { ...r, status: confirm.action, note: note || r.note } : r,
        ),
      );
      setConfirm(null);
      setNote("");
      refetch();
    } catch (e: any) {
      toast.error(`Failed to update request: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<PayoutRequest>[] = [
    {
      key: "type",
      header: "Type",
      render: (r) => {
        const isDm = r.type === "delivery_man";
        const cls = isDm
          ? "bg-violet-50 text-violet-700 border-violet-200"
          : "bg-blue-50 text-primary border-blue-200";
        const Icon = isDm ? Bike : User;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${cls}`}>
            <Icon className="w-3 h-3" />
            {isDm ? "Delivery" : "Vendor"}
          </span>
        );
      },
    },
    {
      key: "requesterName",
      header: "Requester",
      render: (r, i) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8 rounded-full">
            <AvatarFallback
              className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full font-semibold`}
            >
              {r.requesterName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{r.requesterName}</p>
            <p className="text-[11px] text-muted-foreground">{r.requesterEmail || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (r) => (
        <span className="font-semibold text-foreground">
          ${Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "method",
      header: "Method",
      render: (r) =>
        r.method ? (
          <span className="inline-block px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-medium">
            {r.method}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
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
      key: "createdAt",
      header: "Date",
      render: (r) => <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => {
        const canApprove = r.status === "pending";
        const canMarkPaid = r.status === "approved" || r.status === "pending";
        const canReject = r.status === "pending" || r.status === "approved";
        return (
          <div className="flex items-center justify-end gap-1">
            <TableActionButtons onView={() => toast.info(`Viewing ${r.id}`)} />
            {canApprove && (
              <button
                onClick={() => setConfirm({ req: r, action: "approved" })}
                title="Approve"
                className="w-7 h-7 inline-flex items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            {canMarkPaid && (
              <button
                onClick={() => setConfirm({ req: r, action: "paid" })}
                title="Mark Paid"
                className="w-7 h-7 inline-flex items-center justify-center rounded-md text-primary hover:bg-blue-50 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
              </button>
            )}
            {canReject && (
              <button
                onClick={() => setConfirm({ req: r, action: "rejected" })}
                title="Reject"
                className="w-7 h-7 inline-flex items-center justify-center rounded-md text-red-600 hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <CrudListTable<PayoutRequest>
        title="Payout Requests"
        description="Withdrawal requests from restaurant partners and delivery boys"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["requesterName", "requesterEmail", "method"]}
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Pending", value: "pending", match: (r) => r.status === "pending" },
          { label: "Approved", value: "approved", match: (r) => r.status === "approved" },
          { label: "Paid", value: "paid", match: (r) => r.status === "paid" },
          { label: "Rejected", value: "rejected", match: (r) => r.status === "rejected" },
        ]}
        onRefresh={refetch}
        realtimeStatus="subscribed"
        emptyMessage="No payout requests."
      />

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirm?.action === "approved" && "Approve Payout"}
              {confirm?.action === "paid" && "Mark as Paid"}
              {confirm?.action === "rejected" && "Reject Payout"}
            </DialogTitle>
          </DialogHeader>
          {confirm && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requester</span>
                  <span className="font-medium">{confirm.req.requesterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-emerald-600">
                    ${Number(confirm.req.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{confirm.req.method || "—"}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    confirm.action === "paid"
                      ? "Wire reference / TXN id…"
                      : confirm.action === "rejected"
                        ? "Reason for rejection…"
                        : "Internal note for this approval…"
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              onClick={applyAction}
              disabled={busy}
              className={
                confirm?.action === "rejected"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : confirm?.action === "paid"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : ""
              }
            >
              {busy ? "Applying…" : `Confirm — ${confirm?.action || ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
