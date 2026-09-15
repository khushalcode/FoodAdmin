"use client";

import { useState } from "react";
import { toast } from "sonner";
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

interface Category {
  id: string;
  name: string;
  image: string | null;
  parentId?: string | number | null;
  position?: number;
  priority?: number;
  moduleId?: string | number | null;
  slug?: string;
  status: boolean;
  featured: boolean;
}

const FALLBACK: Category[] = [
  { id: "fb-1", name: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200", priority: 1, status: true, featured: true },
  { id: "fb-2", name: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200", priority: 2, status: true, featured: false },
  { id: "fb-3", name: "Sushi", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200", priority: 3, status: true, featured: true },
  { id: "fb-4", name: "Salads", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200", priority: 4, status: true, featured: false },
  { id: "fb-5", name: "Pasta", image: null, priority: 5, status: false, featured: false },
];

export default function CategoriesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Category>({
    endpoint: "/api/categories",
    realtimeTable: "categories",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name,
      image: r.image,
      parentId: r.parentId ?? r.parent_id ?? null,
      position: r.position,
      priority: r.priority ?? r.position,
      moduleId: r.moduleId ?? r.module_id ?? null,
      slug: r.slug,
      status: r.status,
      featured: r.featured,
    }),
    itemName: "Category",
    fallback: FALLBACK,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Partial<Category>>({});

  const openCreate = () => {
    setEditing(null);
    setForm({ status: true, featured: false, priority: 0, image: "" });
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ ...c });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name) {
      toast.error("Category name is required");
      return;
    }
    const payload = {
      name: form.name,
      image: form.image || "",
      priority: Number(form.priority || 0),
      featured: form.featured ?? false,
      status: form.status ?? true,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (ok) setDialogOpen(false);
  };

  const toggle = (c: Category) => update(c.id, { status: !c.status });
  const toggleFeatured = (c: Category) => update(c.id, { featured: !c.featured });

  const onDelete = async (c: Category) => {
    if (!confirm(`Delete category "${c.name}"? This will not delete sub-categories.`)) return;
    await remove(c.id);
  };

  const columns: Column<Category>[] = [
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
        <div>
          <div className="font-semibold text-foreground">{r.name}</div>
          {r.slug && <div className="text-[11px] text-muted-foreground">/{r.slug}</div>}
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      align: "right",
      render: (r) => <span className="font-medium text-foreground">{r.priority ?? r.position ?? 0}</span>,
    },
    {
      key: "featured",
      header: "Featured",
      render: (r) => (
        <button onClick={() => toggleFeatured(r)} className="inline-flex items-center gap-2 group">
          <Switch checked={!!r.featured} />
          <span className={`text-xs font-medium ${r.featured ? "text-fuchsia-600" : "text-muted-foreground"}`}>
            {r.featured ? "Featured" : "—"}
          </span>
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <button onClick={() => toggle(r)} className="inline-flex items-center gap-2 group">
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
        <TableActionButtons
          onView={() => toast.info(`Viewing ${r.name}`)}
          onEdit={() => openEdit(r)}
          onDelete={() => onDelete(r)}
        />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<Category>
        title="Categories"
        description="Manage your food menu categories — top-level navigation"
        items={items}
        loading={loading}
        onRefresh={refetch}
        actionLabel="Add Category"
        onAction={openCreate}
        searchKeys={["name", "slug"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Featured", value: "featured", match: (r) => r.featured === true },
          { label: "Active", value: "active", match: (r) => r.status === true },
          { label: "Inactive", value: "inactive", match: (r) => r.status === false },
        ]}
        columns={columns}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Category Name</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Pizza, Burgers, Sushi"
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
                  className="mt-2 w-16 h-16 rounded-lg object-cover border border-border"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Position (priority)</Label>
              <Input
                type="number"
                value={form.priority ?? 0}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                placeholder="0"
              />
              <p className="text-[11px] text-muted-foreground">Lower numbers appear first in the customer app.</p>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.featured ?? false}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
                <Label>Featured</Label>
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
              {editing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
