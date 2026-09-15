"use client";

import { useState } from "react";
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

interface Bonus {
  id: string;
  title: string;
  bonusAmount: number;
  targetAmount: number;
  status: string;
  startDate: string;
  endDate: string;
}

const FALLBACK: Bonus[] = [
  { id: "WB-01", title: "First Top-up Bonus", bonusAmount: 10, targetAmount: 50, status: "Active", startDate: "2025-10-01", endDate: "2025-12-31" },
  { id: "WB-02", title: "Eid Special Top-up", bonusAmount: 15, targetAmount: 100, status: "Expired", startDate: "2025-04-10", endDate: "2025-04-20" },
  { id: "WB-03", title: "Friday Top-up 5%", bonusAmount: 5, targetAmount: 100, status: "Active", startDate: "2025-01-01", endDate: "2025-12-31" },
  { id: "WB-04", title: "Diwali Dhamaka", bonusAmount: 20, targetAmount: 100, status: "Scheduled", startDate: "2025-11-12", endDate: "2025-11-15" },
  { id: "WB-05", title: "Monthly Loyalty", bonusAmount: 5, targetAmount: 0, status: "Active", startDate: "2025-01-01", endDate: "2025-12-31" },
];

const emptyForm = {
  title: "",
  bonusAmount: "",
  targetAmount: "",
  status: "Active",
  startDate: "",
  endDate: "",
};

export default function WalletBonusPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Bonus>({
    endpoint: "/api/wallet-bonus",
    mapRow: (r) => ({
      id: String(r.id),
      title: r.title ?? r.name ?? "",
      bonusAmount: Number(r.bonusAmount ?? r.bonus_amount ?? 0),
      targetAmount: Number(r.targetAmount ?? r.target_amount ?? 0),
      status: r.status ?? "Active",
      startDate: r.startDate ?? r.start_date ?? "",
      endDate: r.endDate ?? r.end_date ?? "",
    }),
    itemName: "Wallet bonus",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bonus | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (b: Bonus) => {
    setEditing(b);
    setForm({
      title: b.title,
      bonusAmount: String(b.bonusAmount),
      targetAmount: String(b.targetAmount),
      status: b.status,
      startDate: b.startDate,
      endDate: b.endDate,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.bonusAmount) return;
    setSubmitting(true);
    const payload = {
      title: form.title,
      bonusAmount: Number(form.bonusAmount),
      targetAmount: Number(form.targetAmount || 0),
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
    };
    const ok = editing
      ? await update(editing.id, payload)
      : await create(payload);
    setSubmitting(false);
    if (ok) {
      setOpen(false);
      setForm(emptyForm);
      setEditing(null);
    }
  };

  const columns: Column<Bonus>[] = [
    { key: "title", header: "Title", render: (r) => <span className="font-semibold text-[#111827]">{r.title}</span> },
    {
      key: "bonusAmount",
      header: "Bonus",
      align: "right",
      render: (r) => <span className="font-semibold text-emerald-600">+${r.bonusAmount}</span>,
    },
    {
      key: "targetAmount",
      header: "Target",
      align: "right",
      render: (r) =>
        r.targetAmount > 0 ? <span className="text-[#4B5563]">${r.targetAmount}</span> : <span className="text-[#9CA3AF]">—</span>,
    },
    { key: "status", header: "Status" },
    { key: "startDate", header: "Start" },
    { key: "endDate", header: "End" },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <TableActionButtons
          onEdit={() => openEdit(r)}
          onDelete={() => remove(r.id)}
        />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<Bonus>
        title="Wallet Bonus"
        description="Promotional wallet top-up bonuses for customers"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["title"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => r.status === "Active" },
          { label: "Scheduled", value: "scheduled", match: (r) => r.status === "Scheduled" },
          { label: "Expired", value: "expired", match: (r) => r.status === "Expired" },
        ]}
        onRefresh={refetch}
        actionLabel="Create Bonus"
        onAction={openCreate}
        emptyMessage="No wallet bonuses found."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Bonus" : "Create Bonus"}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {editing ? "Update the wallet bonus details." : "Configure a new wallet top-up bonus."}
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="b-title">Title</Label>
              <Input
                id="b-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="First Top-up Bonus"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="b-bonus">Bonus Amount ($)</Label>
                <Input
                  id="b-bonus"
                  type="number"
                  value={form.bonusAmount}
                  onChange={(e) => setForm({ ...form, bonusAmount: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-target">Target Amount ($)</Label>
                <Input
                  id="b-target"
                  type="number"
                  value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                  placeholder="50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="b-start">Start Date</Label>
                <Input
                  id="b-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-end">End Date</Label>
                <Input
                  id="b-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !form.title || !form.bonusAmount}>
              {submitting ? "Saving..." : editing ? "Update Bonus" : "Create Bonus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
