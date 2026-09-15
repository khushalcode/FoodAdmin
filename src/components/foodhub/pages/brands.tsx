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

interface Brand {
  id: string;
  name: string;
  slug?: string;
  image: string | null;
  status: boolean;
  moduleId?: string | number | null;
}

const FALLBACK: Brand[] = [
  { id: "fb-1", name: "Barilla", slug: "barilla", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200", status: true },
  { id: "fb-2", name: "McCormick", slug: "mccormick", image: "https://images.unsplash.com/photo-1599909533730-f9ba3d0eb1c8?w=200", status: true },
  { id: "fb-3", name: "Nestlé Professional", slug: "nestle-professional", image: "https://images.unsplash.com/photo-1588964895597-c0d3d60c1f50?w=200", status: true },
  { id: "fb-4", name: "Heinz", slug: "heinz", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200", status: false },
];

export default function BrandsPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Brand>({
    endpoint: "/api/brands",
    realtimeTable: "brands",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name,
      slug: r.slug,
      image: r.image,
      status: r.status,
      moduleId: r.moduleId ?? r.module_id ?? null,
    }),
    itemName: "Brand",
    fallback: FALLBACK,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<Partial<Brand>>({});

  const openCreate = () => {
    setEditing(null);
    setForm({ status: true, image: "" });
    setDialogOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditing(b);
    setForm({ ...b });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name) {
      toast.error("Brand name is required");
      return;
    }
    const payload = {
      name: form.name,
      image: form.image || "",
      status: form.status ?? true,
      moduleId: form.moduleId ?? null,
    };
    const ok = editing
      ? await update(editing.id, payload)
      : await create(payload);
    if (ok) setDialogOpen(false);
  };

  const toggle = (b: Brand) => update(b.id, { status: !b.status });

  const onDelete = async (b: Brand) => {
    if (!confirm(`Delete brand "${b.name}"?`)) return;
    await remove(b.id);
  };

  const columns: Column<Brand>[] = [
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
      header: "Brand Name",
      render: (r) => (
        <div>
          <div className="font-semibold text-foreground">{r.name}</div>
          {r.slug && <div className="text-[11px] text-muted-foreground">/{r.slug}</div>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <button onClick={() => toggle(r)} className="inline-flex items-center gap-2 group">
          <Switch checked={!!r.status} />
          <span
            className={`text-xs font-medium ${
              r.status ? "text-emerald-600" : "text-muted-foreground"
            }`}
          >
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
      <CrudListTable<Brand>
        title="Brands"
        description="Food brands available across your catalog (realtime-synced)"
        items={items}
        loading={loading}
        onRefresh={refetch}
        actionLabel="Add Brand"
        onAction={openCreate}
        searchKeys={["name", "slug"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => r.status === true },
          { label: "Inactive", value: "inactive", match: (r) => r.status === false },
        ]}
        columns={columns}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Brand" : "Add Brand"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Brand Name</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Barilla, Nestlé, Heinz"
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
              {editing ? "Save Changes" : "Create Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
