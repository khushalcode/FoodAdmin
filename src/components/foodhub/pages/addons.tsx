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

interface Addon {
  id: string;
  name: string;
  price: number;
  status: boolean;
  addonCategoryId?: string | number | null;
  addonCategoryName?: string | null;
}

const FALLBACK: Addon[] = [
  { id: "1", name: "Extra Cheese", price: 1.50, status: true, addonCategoryName: "Toppings" },
  { id: "2", name: "Bacon Strips", price: 2.00, status: true, addonCategoryName: "Toppings" },
  { id: "3", name: "Large Fries", price: 3.50, status: true, addonCategoryName: "Sides" },
  { id: "4", name: "Garlic Sauce", price: 0.75, status: true, addonCategoryName: "Sauces" },
  { id: "5", name: "Spicy Mix", price: 0.50, status: false, addonCategoryName: "Seasonings" },
];

const EMPTY: Addon = {
  id: "",
  name: "",
  price: 0,
  status: true,
  addonCategoryId: "",
  addonCategoryName: "",
};

export default function AddonsPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Addon>({
    endpoint: "/api/addons",
    realtimeTable: "add_ons",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name ?? "",
      price: Number(r.price ?? 0),
      status: r.status ?? true,
      addonCategoryId: r.addonCategoryId ?? null,
      addonCategoryName: r.addonCategoryName ?? null,
    }),
    itemName: "Addon",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Addon | null>(null);
  const [form, setForm] = useState<Addon>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (a: Addon) => {
    setEditing(a);
    setForm({ ...a });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    const payload: Partial<Addon> = {
      name: form.name,
      price: Number(form.price),
      status: form.status,
      addonCategoryId: form.addonCategoryId || null,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (ok) setOpen(false);
  };

  const toggleStatus = (a: Addon) =>
    update(a.id, { status: !a.status });

  const columns: Column<Addon>[] = [
    { key: "id", header: "ID" },
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-semibold text-foreground">{r.name}</span>,
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      render: (r) => (
        <span className="font-medium text-foreground">
          ${Number(r.price).toFixed(2)}
        </span>
      ),
    },
    {
      key: "addonCategoryName",
      header: "Category",
      render: (r) => (
        <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-100 text-xs font-medium">
          {r.addonCategoryName || "—"}
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
      <CrudListTable<Addon>
        title="Add-ons"
        description="Individual add-on items (extra cheese, sauces, etc.) grouped under categories."
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["name", "addonCategoryName"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => !!r.status },
          { label: "Inactive", value: "inactive", match: (r) => !r.status },
        ]}
        actionLabel="Add Addon"
        onAction={openCreate}
        onRefresh={refetch}
        emptyMessage="No add-ons yet. Create your first add-on."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Addon" : "Add Addon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-name">Name *</Label>
              <Input
                id="a-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Extra Cheese"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="a-price">Price ($)</Label>
                <Input
                  id="a-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-cat">Category ID</Label>
                <Input
                  id="a-cat"
                  value={form.addonCategoryId ?? ""}
                  onChange={(e) => setForm({ ...form, addonCategoryId: e.target.value })}
                  placeholder="category UUID"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Make this add-on available</p>
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
              {editing ? "Save Changes" : "Create Addon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
