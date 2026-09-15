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

interface Unit {
  id: string;
  unit: string;
  description: string | null;
  status: boolean;
}

const FALLBACK: Unit[] = [
  { id: "fb-1", unit: "kg", description: "Kilogram — used for bulk weights", status: true },
  { id: "fb-2", unit: "g", description: "Gram — small portions", status: true },
  { id: "fb-3", unit: "L", description: "Liter — liquids", status: true },
  { id: "fb-4", unit: "mL", description: "Milliliter — small liquid volumes", status: true },
  { id: "fb-5", unit: "pc", description: "Piece — countable items", status: false },
];

export default function UnitsPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Unit>({
    endpoint: "/api/units",
    realtimeTable: "units",
    mapRow: (r) => ({
      id: String(r.id),
      unit: r.unit,
      description: r.description,
      status: r.status,
    }),
    itemName: "Unit",
    fallback: FALLBACK,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState<Partial<Unit>>({});

  const openCreate = () => {
    setEditing(null);
    setForm({ status: true, unit: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (u: Unit) => {
    setEditing(u);
    setForm({ ...u });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.unit) {
      toast.error("Unit is required");
      return;
    }
    const payload = {
      unit: form.unit,
      description: form.description || "",
      status: form.status ?? true,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (ok) setDialogOpen(false);
  };

  const toggle = (u: Unit) => update(u.id, { status: !u.status });

  const onDelete = async (u: Unit) => {
    if (!confirm(`Delete unit "${u.unit}"?`)) return;
    await remove(u.id);
  };

  const columns: Column<Unit>[] = [
    { key: "id", header: "ID", render: (r) => <span className="text-muted-foreground text-xs">#{r.id}</span> },
    {
      key: "unit",
      header: "Unit",
      render: (r) => (
        <span className="inline-block px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-semibold">
          {r.unit}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (r) => (
        <span className="text-sm text-muted-foreground line-clamp-1 max-w-md inline-block">
          {r.description || <span className="italic">No description</span>}
        </span>
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
          onView={() => toast.info(`Viewing ${r.unit}`)}
          onEdit={() => openEdit(r)}
          onDelete={() => onDelete(r)}
        />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<Unit>
        title="Units"
        description="Measurement units used across dishes, inventory & recipes"
        items={items}
        loading={loading}
        onRefresh={refetch}
        actionLabel="Add Unit"
        onAction={openCreate}
        searchKeys={["unit", "description"]}
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
            <DialogTitle>{editing ? "Edit Unit" : "Add Unit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Input
                value={form.unit || ""}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="e.g. kg, g, L, mL, pc"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does this unit represent?"
              />
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
              {editing ? "Save Changes" : "Create Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
