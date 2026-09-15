"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreDisbursement {
  id: string;
  storeId: string | null;
  storeName: string;
  vendorName: string;
  amount: number;
  status: string;
  date: string;
}

interface Store {
  id: string;
  name: string;
}

const FALLBACK: StoreDisbursement[] = [
  {
    id: "fb-1",
    storeId: "1",
    storeName: "Bella Italia",
    vendorName: "Marco Rossi",
    amount: 2150,
    status: "completed",
    date: "2025-11-15",
  },
  {
    id: "fb-2",
    storeId: "2",
    storeName: "Sushi Express",
    vendorName: "Yuki Tanaka",
    amount: 1840,
    status: "completed",
    date: "2025-11-14",
  },
  {
    id: "fb-3",
    storeId: "3",
    storeName: "Tandoori House",
    vendorName: "Raj Sharma",
    amount: 980,
    status: "processing",
    date: "2025-11-13",
  },
  {
    id: "fb-4",
    storeId: "4",
    storeName: "Burger Bros",
    vendorName: "Mike Stone",
    amount: 670,
    status: "completed",
    date: "2025-11-12",
  },
  {
    id: "fb-5",
    storeId: "5",
    storeName: "Green Bowl",
    vendorName: "Sarah Green",
    amount: 880,
    status: "failed",
    date: "2025-11-10",
  },
];

const STATUS_CLS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const EMPTY = {
  storeId: "",
  amount: 0,
  status: "pending",
  date: new Date().toISOString().slice(0, 10),
};

export default function StoreDisbursementsPage() {
  const { items, loading, create, remove, refetch } = useCrud<StoreDisbursement>({
    endpoint: "/api/store-disbursements",
    realtimeTable: "disbursements",
    itemName: "Disbursement",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);

  // Fetch stores on mount to populate the select dropdown
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStoresLoading(true);
      try {
        const res = await fetch("/api/stores", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const arr: Store[] = Array.isArray(json)
          ? json.map((s: any) => ({ id: String(s.id), name: s.name }))
          : [];
        if (!cancelled) setStores(arr);
      } catch {
        // Silent fallback — the user can still type a store ID manually
        if (!cancelled) setStores([]);
      } finally {
        if (!cancelled) setStoresLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.storeId || !form.amount) {
      toast.error("Store and amount are required");
      return;
    }
    setSaving(true);
    const ok = await create({
      storeId: form.storeId,
      amount: Number(form.amount),
      status: form.status,
      date: form.date,
    } as Partial<StoreDisbursement>);
    setSaving(false);
    if (ok) setOpen(false);
  };

  const columns: Column<StoreDisbursement>[] = [
    {
      key: "storeName",
      header: "Store",
      render: (r) => (
        <div>
          <p className="font-semibold text-foreground">{r.storeName || `Store #${r.storeId || "—"}`}</p>
          {r.vendorName && r.vendorName !== "—" && (
            <p className="text-[11px] text-muted-foreground">{r.vendorName}</p>
          )}
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
      key: "date",
      header: "Date",
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {(r.date || "").slice(0, 10)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <TableActionButtons
          onView={() => toast.info(`Viewing ${r.id}`)}
          onDelete={() => remove(r.id)}
        />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<StoreDisbursement>
        title="Store Disbursements"
        description="Payouts sent to restaurant partners"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["storeName", "vendorName", "id"]}
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Completed", value: "completed", match: (r) => r.status === "completed" || r.status === "paid" },
          { label: "Processing", value: "processing", match: (r) => r.status === "processing" || r.status === "pending" },
          { label: "Failed", value: "failed", match: (r) => r.status === "failed" },
        ]}
        actionLabel="Create Disbursement"
        onAction={openCreate}
        onRefresh={refetch}
        realtimeStatus="subscribed"
        emptyMessage="No store disbursements yet."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Disbursement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="store">Store</Label>
              {storesLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : stores.length > 0 ? (
                <Select
                  value={form.storeId}
                  onValueChange={(v) => setForm({ ...form, storeId: v })}
                >
                  <SelectTrigger id="store">
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        #{s.id} — {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={form.storeId}
                  onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                  placeholder="Store ID (e.g. 1)"
                  type="number"
                />
              )}
            </div>
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Create Disbursement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
