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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, any> | null;
  isActive: boolean;
}

const FALLBACK: Role[] = [
  { id: "1", name: "Super Admin", description: "Full access to all features", permissions: { all: true }, isActive: true },
  { id: "2", name: "Admin", description: "Standard admin access", permissions: { dashboard: true, orders: true, vendors: true }, isActive: true },
  { id: "3", name: "Manager", description: "Manage day-to-day operations", permissions: { dashboard: true, orders: true }, isActive: true },
  { id: "4", name: "Editor", description: "Edit catalog and content", permissions: { products: true, categories: true }, isActive: true },
  { id: "5", name: "Viewer", description: "Read-only access", permissions: { view: true }, isActive: false },
];

const EMPTY: Role = {
  id: "",
  name: "",
  description: "",
  permissions: {},
  isActive: true,
};

export default function RolesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Role>({
    endpoint: "/api/admin-roles",
    realtimeTable: "admin_roles",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name ?? "",
      description: r.description ?? null,
      permissions: r.permissions ?? null,
      isActive: !!r.isActive,
    }),
    itemName: "Role",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<Role>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (r: Role) => {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    let parsedPermissions = form.permissions;
    try {
      if (typeof form.permissions === "string" && (form.permissions as string).trim()) {
        parsedPermissions = JSON.parse(form.permissions as string);
      }
    } catch {
      toast.error("Permissions must be valid JSON");
      return;
    }
    const ok = editing
      ? await update(editing.id, {
          name: form.name,
          description: form.description,
          permissions: parsedPermissions,
          isActive: form.isActive,
        })
      : await create({
          name: form.name,
          description: form.description,
          permissions: parsedPermissions,
          isActive: form.isActive,
        });
    if (ok) setOpen(false);
  };

  const handleDelete = (r: Role) => {
    if (r.name === "Super Admin") {
      toast.error("Cannot delete the 'Super Admin' role");
      return;
    }
    remove(r.id);
  };

  const toggleActive = (r: Role) => {
    if (r.name === "Super Admin") {
      toast.error("Super Admin role cannot be deactivated");
      return;
    }
    update(r.id, { isActive: !r.isActive });
  };

  const columns: Column<Role>[] = [
    { key: "id", header: "ID" },
    {
      key: "name",
      header: "Role",
      render: (r) => (
        <span className="font-semibold text-foreground inline-flex items-center gap-2">
          {r.name}
          {r.name === "Super Admin" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
              Protected
            </span>
          )}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (r) => (
        <span className="text-muted-foreground text-sm">{r.description || "—"}</span>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (r) => {
        const keys = r.permissions && typeof r.permissions === "object" ? Object.keys(r.permissions) : [];
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {keys.length === 0 ? (
              <span className="text-muted-foreground text-xs">—</span>
            ) : (
              keys.slice(0, 4).map((k) => (
                <span
                  key={k}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-primary border border-blue-100"
                >
                  {k}
                </span>
              ))
            )}
            {keys.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{keys.length - 4}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "isActive",
      header: "Active",
      align: "center",
      render: (r) => (
        <Switch
          checked={!!r.isActive}
          onCheckedChange={() => toggleActive(r)}
          disabled={r.name === "Super Admin"}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <TableActionButtons
          onEdit={() => openEdit(r)}
          onDelete={r.name === "Super Admin" ? undefined : () => handleDelete(r)}
        />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<Role>
        title="Roles & Permissions"
        description="Create custom roles for admins and employees with fine-grained permission control."
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["name", "description"]}
        statusKey="isActive"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => !!r.isActive },
          { label: "Inactive", value: "inactive", match: (r) => !r.isActive },
        ]}
        actionLabel="Add Role"
        onAction={openCreate}
        onRefresh={refetch}
        emptyMessage="No roles defined. Add your first role."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Role" : "Add Role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="r-name">Role name *</Label>
              <Input
                id="r-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Manager"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-desc">Description</Label>
              <Textarea
                id="r-desc"
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this role"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-perm">Permissions (JSON)</Label>
              <Textarea
                id="r-perm"
                value={
                  typeof form.permissions === "string"
                    ? form.permissions
                    : JSON.stringify(form.permissions ?? {}, null, 2)
                }
                onChange={(e) => setForm({ ...form, permissions: e.target.value as any })}
                placeholder='{"dashboard": true, "orders": true}'
                rows={4}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Define which modules/actions this role can access.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Enable this role</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(c) => setForm({ ...form, isActive: c })}
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
              {editing ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
