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

interface Zone {
  id: string;
  name: string;
  isDefault: boolean;
  status: boolean;
}

const FALLBACK: Zone[] = [
  { id: "1", name: "Downtown", isDefault: true, status: true },
  { id: "2", name: "Uptown", isDefault: false, status: true },
  { id: "3", name: "Suburbs North", isDefault: false, status: true },
  { id: "4", name: "Suburbs South", isDefault: false, status: false },
  { id: "5", name: "Airport Zone", isDefault: false, status: true },
];

const EMPTY: Zone = { id: "", name: "", isDefault: false, status: true };

export default function ZonesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Zone>({
    endpoint: "/api/zones",
    realtimeTable: "zones",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name ?? "",
      isDefault: !!r.isDefault,
      status: r.status ?? true,
    }),
    itemName: "Zone",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [form, setForm] = useState<Zone>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (z: Zone) => {
    setEditing(z);
    setForm({ ...z });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    const ok = editing
      ? await update(editing.id, {
          name: form.name,
          isDefault: form.isDefault,
          status: form.status,
        })
      : await create({
          name: form.name,
          isDefault: form.isDefault,
          status: form.status,
        });
    if (ok) setOpen(false);
  };

  const toggleStatus = (z: Zone) =>
    update(z.id, { status: !z.status });

  const toggleDefault = (z: Zone) =>
    update(z.id, { isDefault: !z.isDefault });

  const columns: Column<Zone>[] = [
    { key: "id", header: "ID" },
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-semibold text-foreground">{r.name}</span>,
    },
    {
      key: "isDefault",
      header: "Default",
      align: "center",
      render: (r) => (
        <Switch checked={r.isDefault} onCheckedChange={() => toggleDefault(r)} />
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
      <CrudListTable<Zone>
        title="Zones"
        description="Manage service zones — geographic areas where delivery is available."
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["name"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => !!r.status },
          { label: "Inactive", value: "inactive", match: (r) => !r.status },
          { label: "Default", value: "default", match: (r) => !!r.isDefault },
        ]}
        actionLabel="Add Zone"
        onAction={openCreate}
        onRefresh={refetch}
        emptyMessage="No zones configured yet. Add your first zone."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Zone" : "Add Zone"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="z-name">Name</Label>
              <Input
                id="z-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Downtown"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Default zone</p>
                <p className="text-xs text-muted-foreground">Set as the primary zone</p>
              </div>
              <Switch
                checked={form.isDefault}
                onCheckedChange={(c) => setForm({ ...form, isDefault: c })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Enable this zone</p>
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
              {editing ? "Save Changes" : "Create Zone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
