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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface AddonCategory {
  id: string;
  name: string;
  description: string | null;
  status: boolean;
}

const FALLBACK: AddonCategory[] = [
  { id: "1", name: "Toppings", description: "Extra toppings for pizzas and burgers", status: true },
  { id: "2", name: "Sauces", description: "Dipping and drizzle sauces", status: true },
  { id: "3", name: "Sides", description: "Side dishes like fries and salads", status: true },
  { id: "4", name: "Seasonings", description: "Spice and seasoning options", status: true },
  { id: "5", name: "Beverage Upgrades", description: "Upgrade drinks to larger sizes", status: false },
];

const EMPTY: AddonCategory = {
  id: "",
  name: "",
  description: "",
  status: true,
};

export default function AddonActivationPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<AddonCategory>({
    endpoint: "/api/addon-categories",
    realtimeTable: "addon_categories",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name ?? "",
      description: r.description ?? null,
      status: r.status ?? true,
    }),
    itemName: "Addon Category",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AddonCategory | null>(null);
  const [form, setForm] = useState<AddonCategory>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (c: AddonCategory) => {
    setEditing(c);
    setForm({ ...c });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    const ok = editing
      ? await update(editing.id, {
          name: form.name,
          description: form.description,
          status: form.status,
        })
      : await create({
          name: form.name,
          description: form.description,
          status: form.status,
        });
    if (ok) setOpen(false);
  };

  const toggleStatus = (c: AddonCategory) =>
    update(c.id, { status: !c.status });

  const columns: Column<AddonCategory>[] = [
    { key: "id", header: "ID" },
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-semibold text-foreground">{r.name}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (r) => (
        <span className="text-muted-foreground text-sm line-clamp-1 max-w-md">
          {r.description || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Active",
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
      <CrudListTable<AddonCategory>
        title="Addon Activation"
        description="Activate or deactivate groups of add-ons via their parent categories."
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["name", "description"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => !!r.status },
          { label: "Inactive", value: "inactive", match: (r) => !r.status },
        ]}
        actionLabel="Add Category"
        onAction={openCreate}
        onRefresh={refetch}
        emptyMessage="No addon categories yet. Create your first category."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ac-name">Name *</Label>
              <Input
                id="ac-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Toppings"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ac-desc">Description</Label>
              <Textarea
                id="ac-desc"
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Brief description of this addon category"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Activate add-ons in this category</p>
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
              {editing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
