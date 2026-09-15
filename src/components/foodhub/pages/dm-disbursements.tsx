"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Disbursement {
  id: string;
  deliveryManId: string;
  dmName: string;
  amount: number;
  status: string;
  date: string;
}

const FALLBACK: Disbursement[] = [
  { id: "DMD-001", deliveryManId: "DM-01", dmName: "Carlos Rivera", amount: 3840, status: "Completed", date: "2025-12-01" },
  { id: "DMD-002", deliveryManId: "DM-02", dmName: "Aisha Khan", amount: 4120, status: "Completed", date: "2025-12-01" },
  { id: "DMD-003", deliveryManId: "DM-03", dmName: "David Park", amount: 2840, status: "Completed", date: "2025-12-01" },
  { id: "DMD-004", deliveryManId: "DM-04", dmName: "Maria Santos", amount: 5280, status: "Processing", date: "2025-12-01" },
  { id: "DMD-005", deliveryManId: "DM-05", dmName: "James Wilson", amount: 1420, status: "Pending", date: "2025-12-01" },
];

const COLORS = [
  "from-orange-500 to-red-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-indigo-500 to-violet-600",
];

// Small helper to fetch DM list for the select dropdown
interface DM { id: string; name: string }

export default function DmDisbursementsPage() {
  const { items, loading, create, remove, refetch } = useCrud<Disbursement>({
    endpoint: "/api/dm-disbursements",
    mapRow: (r) => ({
      id: String(r.id),
      deliveryManId: String(r.deliveryManId ?? r.delivery_man_id ?? ""),
      dmName: r.dmName ?? r.dm_name ?? r.name ?? "",
      amount: Number(r.amount ?? 0),
      status: r.status ?? "Pending",
      date: r.date ?? "",
    }),
    itemName: "Disbursement",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [dmList, setDmList] = useState<DM[]>([]);
  const [form, setForm] = useState({
    deliveryManId: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch delivery-men list for the Select dropdown when dialog opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch("/api/delivery-men", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const arr: any[] = Array.isArray(json) ? json : (json.items ?? []);
        setDmList(
          arr.map((r) => ({
            id: String(r.id),
            name: r.name ?? `${r.fName ?? ""} ${r.lName ?? ""}`.trim(),
          })),
        );
      } catch {
        // ignore — select will just be empty
      }
    })();
  }, [open]);

  const handleCreate = async () => {
    const amount = Number(form.amount);
    if (!form.deliveryManId || !amount || amount <= 0) {
      toast.error("Select a DM and enter a valid amount");
      return;
    }
    setSubmitting(true);
    const ok = await create({
      deliveryManId: form.deliveryManId,
      amount,
      date: form.date,
      status: "Pending",
    });
    setSubmitting(false);
    if (ok) {
      setOpen(false);
      setForm({ deliveryManId: "", amount: "", date: new Date().toISOString().slice(0, 10) });
    }
  };

  const columns: Column<Disbursement>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-semibold text-primary">{r.id}</span> },
    {
      key: "dmName",
      header: "DM",
      render: (r, i) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8 rounded-full">
            <AvatarFallback className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full font-semibold`}>
              {r.dmName
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-[#111827]">{r.dmName}</p>
            <p className="text-xs text-[#9CA3AF]">{r.deliveryManId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (r) => <span className="font-bold text-emerald-600">${r.amount.toLocaleString()}</span>,
    },
    { key: "status", header: "Status" },
    { key: "date", header: "Date" },
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
      <CrudListTable<Disbursement>
        title="DM Disbursements"
        description="Payouts sent to delivery personnel"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["dmName", "deliveryManId"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Pending", value: "pending", match: (r) => r.status === "Pending" },
          { label: "Processing", value: "processing", match: (r) => r.status === "Processing" },
          { label: "Completed", value: "completed", match: (r) => r.status === "Completed" },
          { label: "Failed", value: "failed", match: (r) => r.status === "Failed" },
        ]}
        onRefresh={refetch}
        actionLabel="Create Disbursement"
        onAction={() => setOpen(true)}
        emptyMessage="No disbursements found."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Disbursement</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Issue a payout to a delivery person.
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-dm">Delivery Man</Label>
              <Select value={form.deliveryManId} onValueChange={(v) => setForm({ ...form, deliveryManId: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={dmList.length === 0 ? "No DMs available" : "Select a delivery man"} />
                </SelectTrigger>
                <SelectContent>
                  {dmList.map((dm) => (
                    <SelectItem key={dm.id} value={dm.id}>
                      {dm.name} ({dm.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="d-amount">Amount ($)</Label>
                <Input
                  id="d-amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="d-date">Date</Label>
                <Input
                  id="d-date"
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
            <Button onClick={handleCreate} disabled={submitting || !form.deliveryManId || !form.amount}>
              {submitting ? "Creating..." : "Create Disbursement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
