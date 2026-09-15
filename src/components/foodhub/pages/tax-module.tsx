"use client";

import { useState } from "react";
import { CrudListTable, type Column } from "../shared/crud-list-table";
import { useCrud } from "@/hooks/use-crud";
import { TableActionButtons } from "../shared/list-page";
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
import { Switch } from "@/components/ui/switch";

interface Tax {
  id: string;
  name: string;
  code: string | null;
  taxRate: number | null;
  taxType: string | null;
  status: boolean;
  countryCode?: string | null;
  isDefault?: boolean | null;
}

const FALLBACK: Tax[] = [
  { id: "1", name: "Standard VAT", code: "VAT-20", taxRate: 20, taxType: "percent", status: true, isDefault: true },
  { id: "2", name: "Reduced VAT", code: "VAT-5", taxRate: 5, taxType: "percent", status: true },
  { id: "3", name: "Zero Rate", code: "ZERO", taxRate: 0, taxType: "percent", status: true },
  { id: "4", name: "Sales Tax (US)", code: "ST-US", taxRate: 7.25, taxType: "percent", status: true },
  { id: "5", name: "Flat Fee", code: "FLAT-1", taxRate: 1.00, taxType: "fixed", status: false },
];

const EMPTY: Tax = {
  id: "",
  name: "",
  code: "",
  taxRate: 0,
  taxType: "percent",
  status: true,
};

export default function TaxModulePage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Tax>({
    endpoint: "/api/taxes",
    realtimeTable: "taxes",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name ?? "",
      code: r.code ?? null,
      taxRate: r.taxRate != null ? Number(r.taxRate) : null,
      taxType: r.taxType ?? null,
      status: r.status ?? true,
      countryCode: r.countryCode ?? null,
      isDefault: r.isDefault ?? null,
    }),
    itemName: "Tax",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tax | null>(null);
  const [form, setForm] = useState<Tax>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (t: Tax) => {
    setEditing(t);
    setForm({ ...t });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    const payload: Partial<Tax> = {
      name: form.name,
      code: form.code,
      taxRate: Number(form.taxRate),
      taxType: form.taxType,
      status: form.status,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (ok) setOpen(false);
  };

  const toggleStatus = (t: Tax) =>
    update(t.id, { status: !t.status });

  const columns: Column<Tax>[] = [
    { key: "id", header: "ID" },
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-semibold text-foreground">{r.name}</span>,
    },
    {
      key: "code",
      header: "Code",
      render: (r) => (
        <span className="inline-block px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-mono">
          {r.code || "—"}
        </span>
      ),
    },
    {
      key: "taxRate",
      header: "Rate",
      align: "right",
      render: (r) => (
        <span className="font-medium text-foreground">
          {r.taxRate != null ? Number(r.taxRate) : "—"}
          {r.taxType === "percent" ? "%" : r.taxType === "fixed" ? "$" : ""}
        </span>
      ),
    },
    {
      key: "taxType",
      header: "Type",
      render: (r) => (
        <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-primary text-xs font-medium capitalize">
          {r.taxType || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (r) => (
        <Switch checked={!!r.status} onCheckedChange={() => toggleStatus(r)} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <TableActionButtons onEdit={() => openEdit(r)} onDelete={() => remove(r.id)} />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<Tax>
        title="Tax Module"
        description="Configure tax rules — percentage or flat, applied at checkout."
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["name", "code"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => !!r.status },
          { label: "Inactive", value: "inactive", match: (r) => !r.status },
          { label: "Percent", value: "percent", match: (r) => r.taxType === "percent" },
          { label: "Fixed", value: "fixed", match: (r) => r.taxType === "fixed" },
        ]}
        actionLabel="Add Tax"
        onAction={openCreate}
        onRefresh={refetch}
        emptyMessage="No tax rules configured. Add your first tax."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Tax" : "Add Tax"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="t-name">Name *</Label>
              <Input
                id="t-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Standard VAT"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-code">Code</Label>
              <Input
                id="t-code"
                value={form.code ?? ""}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="VAT-20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-rate">Rate</Label>
              <Input
                id="t-rate"
                type="number"
                step="0.01"
                min="0"
                value={form.taxRate ?? 0}
                onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-type">Type</Label>
              <select
                id="t-type"
                value={form.taxType ?? "percent"}
                onChange={(e) => setForm({ ...form, taxType: e.target.value })}
                className="w-full h-9 rounded-md border bg-transparent px-3 text-sm"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed amount ($)</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Apply this tax at checkout</p>
              </div>
              <Switch
                checked={form.status}
                onCheckedChange={(c) => setForm({ ...form, status: c })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90 text-white"
              onClick={submit}
            >
              {editing ? "Save Changes" : "Create Tax"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
