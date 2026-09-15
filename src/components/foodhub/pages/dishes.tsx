"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Star, Eye, Pencil, Trash2 } from "lucide-react";
import { CrudListTable, type Column } from "../shared/crud-list-table";
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
import { Textarea } from "@/components/ui/textarea";

interface Dish {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  tax?: number;
  discount?: number;
  veg: boolean;
  stock: number;
  status: boolean;
  isApproved: boolean;
  featured: boolean;
  storeId?: string | number | null;
  storeName?: string | null;
  categoryId?: string | number | null;
  categoryName?: string | null;
  moduleId?: string | number | null;
}

const FALLBACK: Dish[] = [
  {
    id: "fb-1",
    name: "Margherita Pizza",
    description: "Classic mozzarella & basil",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200",
    price: 12.99,
    tax: 0,
    discount: 0,
    veg: true,
    stock: 45,
    status: true,
    isApproved: true,
    featured: true,
    storeName: "Bella Italia",
    categoryName: "Pizza",
  },
  {
    id: "fb-2",
    name: "Beef Burger Deluxe",
    description: "Juicy beef patty, cheddar & onions",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
    price: 11.49,
    tax: 0,
    discount: 0,
    veg: false,
    stock: 30,
    status: true,
    isApproved: false,
    featured: false,
    storeName: "Burger Bros",
    categoryName: "Burgers",
  },
  {
    id: "fb-3",
    name: "Spicy Tuna Roll",
    description: "Fresh tuna, wasabi mayo, nori",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200",
    price: 16.99,
    tax: 0,
    discount: 10,
    veg: false,
    stock: 12,
    status: false,
    isApproved: true,
    featured: true,
    storeName: "Sushi Express",
    categoryName: "Sushi",
  },
];

export default function DishesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Dish>({
    endpoint: "/api/items",
    realtimeTable: "items",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name,
      description: r.description,
      image: r.image,
      price: Number(r.price || 0),
      tax: Number(r.tax || 0),
      discount: Number(r.discount || 0),
      veg: r.veg,
      stock: r.stock,
      status: r.status,
      isApproved: r.isApproved,
      featured: r.featured,
      storeId: r.storeId ?? r.store_id ?? null,
      storeName: r.storeName,
      categoryId: r.categoryId ?? r.category_id ?? null,
      categoryName: r.categoryName,
      moduleId: r.moduleId ?? r.module_id ?? null,
    }),
    itemName: "Dish",
    fallback: FALLBACK,
  });

  // Fetch categories + stores to populate create/edit form selects
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, storeRes] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/stores", { cache: "no-store" }),
        ]);
        if (catRes.ok) {
          const json = await catRes.json();
          setCategories(
            (json || [])
              .filter((c: any) => !c.parentId && !c.parent_id)
              .map((c: any) => ({ id: String(c.id), name: c.name })),
          );
        }
        if (storeRes.ok) {
          const json = await storeRes.json();
          setStores((json || []).map((s: any) => ({ id: String(s.id), name: s.name })));
        }
      } catch {
        /* non-fatal — selects will be empty */
      }
    })();
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [form, setForm] = useState<Partial<Dish>>({});

  const openCreate = () => {
    setEditing(null);
    setForm({
      status: true,
      isApproved: true,
      featured: false,
      veg: true,
      stock: 100,
      price: 0,
      discount: 0,
      tax: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (d: Dish) => {
    setEditing(d);
    setForm({ ...d });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name) {
      toast.error("Dish name is required");
      return;
    }
    if (form.price === undefined || form.price === null) {
      toast.error("Price is required");
      return;
    }
    if (!form.storeId) {
      toast.error("Please select a store");
      return;
    }
    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }
    const payload = {
      name: form.name,
      description: form.description || "",
      image: form.image || "",
      price: Number(form.price),
      storeId: form.storeId,
      categoryId: form.categoryId,
      tax: Number(form.tax || 0),
      discount: Number(form.discount || 0),
      veg: form.veg ?? true,
      stock: Number(form.stock || 0),
      featured: form.featured ?? false,
      status: form.status ?? true,
      isApproved: form.isApproved ?? true,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (ok) setDialogOpen(false);
  };

  const toggleStatus = (d: Dish) =>
    update(d.id, { status: !d.status });

  const toggleFeatured = (d: Dish) =>
    update(d.id, { featured: !d.featured });

  const approve = async (d: Dish) => {
    const ok = await update(d.id, { isApproved: true });
    if (ok) toast.success(`"${d.name}" approved`);
  };

  const onDelete = async (d: Dish) => {
    if (!confirm(`Delete dish "${d.name}"? This cannot be undone.`)) return;
    await remove(d.id);
  };

  const columns: Column<Dish>[] = [
    { key: "id", header: "ID", render: (r) => <span className="text-muted-foreground text-xs">#{r.id}</span> },
    {
      key: "image",
      header: "Image",
      render: (r) =>
        r.image ? (
          <img
            src={r.image}
            alt={r.name}
            className="w-10 h-10 rounded-lg object-cover border border-border"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-fuchsia-500/20 flex items-center justify-center text-[10px] font-semibold text-primary">
            {r.name?.slice(0, 2).toUpperCase()}
          </div>
        ),
    },
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="min-w-[180px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-3.5 h-3.5 rounded-sm border-2 inline-flex items-center justify-center text-[8px] text-white ${
                r.veg ? "border-emerald-500 bg-emerald-500" : "border-red-500 bg-red-500"
              }`}
            >
              ●
            </span>
            <span className="font-semibold text-foreground truncate">{r.name}</span>
          </div>
          {r.storeName && (
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {r.storeName}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      render: (r) => (
        <div className="text-right">
          <div className="font-semibold text-foreground">
            ${Number(r.price).toFixed(2)}
          </div>
          {r.discount && r.discount > 0 && (
            <div className="text-[10px] text-amber-600">-{Number(r.discount)}% off</div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (r) => (
        <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
          {r.categoryName || (r.categoryId ? `#${r.categoryId}` : "—")}
        </span>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      render: (r) => (
        <button onClick={() => toggleFeatured(r)} className="inline-flex items-center gap-1.5 group">
          <Star
            className={`w-4 h-4 ${
              r.featured ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {r.featured ? "Yes" : "No"}
          </span>
        </button>
      ),
    },
    {
      key: "isApproved",
      header: "Approved",
      render: (r) =>
        r.isApproved ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
            <Check className="w-3 h-3" />
            Approved
          </span>
        ) : (
          <button
            onClick={() => approve(r)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <X className="w-3 h-3" />
            Approve
          </button>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <button onClick={() => toggleStatus(r)} className="inline-flex items-center gap-2 group">
          <Switch checked={!!r.status} />
          <span className={`text-xs font-medium ${r.status ? "text-emerald-600" : "text-muted-foreground"}`}>
            {r.status ? "Active" : "Inactive"}
          </span>
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => toast.info(`Viewing ${r.name}`)}
            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-blue-50 hover:text-primary transition-colors"
            title="View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openEdit(r)}
            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(r)}
            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CrudListTable<Dish>
        title="Dishes"
        description="Manage your menu — prices, stock, featured items & approvals"
        items={items}
        loading={loading}
        onRefresh={refetch}
        actionLabel="Add Dish"
        onAction={openCreate}
        searchKeys={["name", "storeName", "categoryName"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => r.status === true },
          { label: "Inactive", value: "inactive", match: (r) => r.status === false },
          { label: "Featured", value: "featured", match: (r) => r.featured === true },
          { label: "Pending Approval", value: "pending", match: (r) => r.isApproved === false },
        ]}
        columns={columns}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Dish" : "Add Dish"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Margherita Pizza"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description of the dish"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                value={form.image || ""}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="preview"
                  className="mt-2 w-20 h-20 rounded-lg object-cover border border-border"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Store</Label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.storeId ? String(form.storeId) : ""}
                  onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                >
                  <option value="">Select store…</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.categoryId ? String(form.categoryId) : ""}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price ?? 0}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={form.discount ?? 0}
                  onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.stock ?? 0}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.veg ?? true}
                  onCheckedChange={(v) => setForm({ ...form, veg: v })}
                />
                <Label>Vegetarian</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.featured ?? false}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isApproved ?? true}
                  onCheckedChange={(v) => setForm({ ...form, isApproved: v })}
                />
                <Label>Approved</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.status ?? true}
                  onCheckedChange={(v) => setForm({ ...form, status: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={save}
              className="bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90 text-white"
            >
              {editing ? "Save Changes" : "Create Dish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
