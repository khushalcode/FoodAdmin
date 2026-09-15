"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";

interface RestaurantCategory {
  id: string;
  storeId: string | null;
  storeName: string;
  name: string;
  slug: string | null;
  image: string | null;
  priority: number;
  status: boolean;
  moduleId: string | null;
  createdAt: string;
}

const FALLBACK: RestaurantCategory[] = [
  { id: "fb-1", storeId: "1", storeName: "Bella Italia", name: "Pizzas", slug: "pizzas", image: null, priority: 1, status: true, moduleId: null, createdAt: "2025-11-01T10:00:00Z" },
  { id: "fb-2", storeId: "1", storeName: "Bella Italia", name: "Pastas", slug: "pastas", image: null, priority: 2, status: true, moduleId: null, createdAt: "2025-11-01T10:05:00Z" },
  { id: "fb-3", storeId: "2", storeName: "Burger Bros", name: "Burgers", slug: "burgers", image: null, priority: 1, status: true, moduleId: null, createdAt: "2025-11-02T10:00:00Z" },
  { id: "fb-4", storeId: "3", storeName: "Sushi Express", name: "Rolls", slug: "rolls", image: null, priority: 1, status: false, moduleId: null, createdAt: "2025-11-03T10:00:00Z" },
  { id: "fb-5", storeId: "4", storeName: "Green Bowl", name: "Salads", slug: "salads", image: null, priority: 3, status: true, moduleId: null, createdAt: "2025-11-04T10:00:00Z" },
];

const EMPTY = {
  storeId: "",
  name: "",
  slug: "",
  image: "",
  priority: 0,
  status: true,
  moduleId: "",
};

export default function RestaurantCategoriesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<RestaurantCategory>({
    endpoint: "/api/restaurant-categories",
    realtimeTable: "store_categories",
    itemName: "Category",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RestaurantCategory | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  };

  const openEdit = (c: RestaurantCategory) => {
    setEditing(c);
    setForm({
      storeId: c.storeId ?? "",
      name: c.name,
      slug: c.slug ?? "",
      image: c.image ?? "",
      priority: c.priority,
      status: c.status,
      moduleId: c.moduleId ?? "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.storeId || !form.name) {
      toast.error("Store ID and name are required");
      return;
    }
    setSaving(true);
    const payload: Partial<RestaurantCategory> = {
      storeId: form.storeId,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      image: form.image || null,
      priority: Number(form.priority),
      status: form.status,
      moduleId: form.moduleId || null,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    setSaving(false);
    if (ok) setOpen(false);
  };

  const columns: Column<RestaurantCategory>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-base">
            🍽️
          </div>
          <div>
            <p className="font-semibold text-foreground">{r.name}</p>
            {r.slug && <p className="text-[11px] text-muted-foreground font-mono">/{r.slug}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "storeName",
      header: "Store",
      render: (r) => (
        <span className="text-sm text-muted-foreground">
          {r.storeName || "—"}
          {r.storeId && <span className="text-[11px] block">#{r.storeId}</span>}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      align: "right",
      render: (r) => (
        <span className="inline-block w-7 h-7 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-semibold leading-7 text-center">
          {r.priority ?? 0}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <button
          onClick={() => update(r.id, { status: !r.status })}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
            r.status
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
          }`}
          title={r.status ? "Click to disable" : "Click to enable"}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {r.status ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <TableActionButtons
          onView={() => toast.info(`Viewing ${r.name}`)}
          onEdit={() => openEdit(r)}
          onDelete={() => remove(r.id)}
        />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<RestaurantCategory>
        title="Restaurant Categories"
        description="Categorize dishes & items per restaurant store"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["name", "slug", "storeName"]}
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => r.status === true },
          { label: "Inactive", value: "inactive", match: (r) => r.status === false },
        ]}
        actionLabel="Add Category"
        onAction={openCreate}
        onRefresh={refetch}
        realtimeStatus="subscribed"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Pizzas"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeId">Store ID</Label>
                <Input
                  id="storeId"
                  type="number"
                  value={form.storeId}
                  onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                  placeholder="e.g. 1"
                />
              </div>
              <div>
                <Label htmlFor="moduleId">Module ID (optional)</Label>
                <Input
                  id="moduleId"
                  type="number"
                  value={form.moduleId}
                  onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
                  placeholder="e.g. 1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="pizzas"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://cdn.example.com/cat.jpg"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="status">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive categories are hidden from the storefront</p>
              </div>
              <Switch
                id="status"
                checked={form.status}
                onCheckedChange={(v) => setForm({ ...form, status: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
