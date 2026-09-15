"use client";

import { useEffect, useState } from "react";
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

interface SubCategory {
  id: string;
  name: string;
  image: string | null;
  parentId: string | number | null;
  parentName?: string | null;
  priority?: number;
  position?: number;
  moduleId?: string | number | null;
  slug?: string;
  status: boolean;
  featured?: boolean;
}

interface ParentCategory {
  id: string;
  name: string;
}

const FALLBACK: SubCategory[] = [
  { id: "fb-1", name: "Margherita Pizzas", image: null, parentId: "1", parentName: "Pizza", priority: 1, status: true },
  { id: "fb-2", name: "Pepperoni Pizzas", image: null, parentId: "1", parentName: "Pizza", priority: 2, status: true },
  { id: "fb-3", name: "Beef Burgers", image: null, parentId: "2", parentName: "Burgers", priority: 1, status: true },
  { id: "fb-4", name: "Chicken Burgers", image: null, parentId: "2", parentName: "Burgers", priority: 2, status: false },
  { id: "fb-5", name: "Maki Rolls", image: null, parentId: "4", parentName: "Sushi", priority: 1, status: true },
];

export default function SubCategoriesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<SubCategory>({
    endpoint: "/api/sub-categories",
    realtimeTable: "categories",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name,
      image: r.image,
      parentId: r.parentId ?? r.parent_id ?? null,
      parentName: r.parentName,
      priority: r.priority ?? r.position,
      position: r.position,
      moduleId: r.moduleId ?? r.module_id ?? null,
      slug: r.slug,
      status: r.status,
      featured: r.featured,
    }),
    itemName: "Sub Category",
    fallback: FALLBACK,
  });

  const [parents, setParents] = useState<ParentCategory[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const parentsOnly = (json || [])
          .filter((c: any) => !c.parentId && !c.parent_id)
          .map((c: any) => ({ id: String(c.id), name: c.name }));
        setParents(parentsOnly);
      } catch {
        /* non-fatal */
      }
    })();
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubCategory | null>(null);
  const [form, setForm] = useState<Partial<SubCategory>>({});

  const openCreate = () => {
    setEditing(null);
    setForm({ status: true, priority: 0, image: "" });
    setDialogOpen(true);
  };

  const openEdit = (s: SubCategory) => {
    setEditing(s);
    setForm({ ...s });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name) {
      toast.error("Sub-category name is required");
      return;
    }
    if (!form.parentId) {
      toast.error("Please select a parent category");
      return;
    }
    const payload = {
      name: form.name,
      image: form.image || "",
      parentId: form.parentId,
      priority: Number(form.priority || 0),
      status: form.status ?? true,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (ok) setDialogOpen(false);
  };

  const toggle = (s: SubCategory) => update(s.id, { status: !s.status });

  const onDelete = async (s: SubCategory) => {
    if (!confirm(`Delete sub-category "${s.name}"?`)) return;
    await remove(s.id);
  };

  const columns: Column<SubCategory>[] = [
    { key: "id", header: "ID", render: (r) => <span className="text-muted-foreground text-xs">#{r.id}</span> },
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          {r.image ? (
            <img
              src={r.image}
              alt={r.name}
              className="w-8 h-8 rounded-md object-cover border border-border"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary/20 to-fuchsia-500/20 flex items-center justify-center text-[10px] font-semibold text-primary">
              {r.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-foreground">{r.name}</span>
        </div>
      ),
    },
    {
      key: "parent",
      header: "Parent",
      render: (r) => (
        <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
          {r.parentName || (r.parentId ? `#${r.parentId}` : "—")}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      align: "right",
      render: (r) => <span className="font-medium text-foreground">{r.priority ?? r.position ?? 0}</span>,
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
      <CrudListTable<SubCategory>
        title="Sub Categories"
        description="Group dishes into sub-categories for finer navigation"
        items={items}
        loading={loading}
        onRefresh={refetch}
        actionLabel="Add Sub Category"
        onAction={openCreate}
        searchKeys={["name", "parentName"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => r.status === true },
          { label: "Inactive", value: "inactive", match: (r) => r.status === false },
        ]}
        columns={columns}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Sub Category" : "Add Sub Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Margherita Pizzas"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Parent Category</Label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.parentId ? String(form.parentId) : ""}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                >
                  <option value="">Select parent…</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {parents.length === 0 && (
                  <p className="text-[11px] text-amber-600">
                    No parent categories loaded — enter ID manually below.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={form.priority ?? 0}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            {parents.length === 0 && (
              <div className="space-y-1.5">
                <Label>Parent ID (fallback)</Label>
                <Input
                  value={form.parentId ? String(form.parentId) : ""}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  placeholder="1"
                />
              </div>
            )}
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={form.status ?? true}
                onCheckedChange={(v) => setForm({ ...form, status: v })}
              />
              <Label>Active</Label>
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
              {editing ? "Save Changes" : "Create Sub Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
