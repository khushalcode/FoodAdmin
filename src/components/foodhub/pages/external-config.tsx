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

interface ExternalConfig {
  id: string;
  key: string;
  value: string | null;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const FALLBACK: ExternalConfig[] = [
  { id: "1", key: "GOOGLE_MAPS_API_KEY", value: "AIzaSy••••••••••••", isActive: true },
  { id: "2", key: "FCM_SERVER_KEY", value: "AAAA••••••••••••", isActive: true },
  { id: "3", key: "TWILIO_AUTH_TOKEN", value: "••••••••••••", isActive: true },
  { id: "4", key: "STRIPE_WEBHOOK_SECRET", value: "whsec_••••••••••••", isActive: true },
  { id: "5", key: "SENTRY_DSN", value: "", isActive: false },
];

const EMPTY: ExternalConfig = {
  id: "",
  key: "",
  value: "",
  isActive: true,
};

export default function ExternalConfigPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<ExternalConfig>({
    endpoint: "/api/external-config",
    realtimeTable: "external_configurations",
    mapRow: (r) => ({
      id: String(r.id),
      key: r.key ?? "",
      value: r.value ?? null,
      isActive: r.isActive ?? true,
      createdAt: r.createdAt ?? null,
      updatedAt: r.updatedAt ?? null,
    }),
    itemName: "Config",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExternalConfig | null>(null);
  const [form, setForm] = useState<ExternalConfig>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (c: ExternalConfig) => {
    setEditing(c);
    setForm({ ...c });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.key.trim()) return;
    const ok = editing
      ? await update(editing.id, {
          key: form.key,
          value: form.value,
          isActive: form.isActive,
        })
      : await create({
          key: form.key,
          value: form.value,
          isActive: form.isActive,
        });
    if (ok) setOpen(false);
  };

  const toggleActive = (c: ExternalConfig) =>
    update(c.id, { isActive: !c.isActive });

  const columns: Column<ExternalConfig>[] = [
    { key: "id", header: "ID" },
    {
      key: "key",
      header: "Key",
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-foreground">{r.key}</span>
      ),
    },
    {
      key: "value",
      header: "Value",
      render: (r) => (
        <span className="text-muted-foreground font-mono text-xs">
          {r.value ? (r.value.length > 32 ? r.value.slice(0, 32) + "•••" : r.value) : "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Active",
      align: "center",
      render: (r) => (
        <Switch checked={!!r.isActive} onCheckedChange={() => toggleActive(r)} />
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
      <CrudListTable<ExternalConfig>
        title="External Configurations"
        description="Secrets and API keys used by the platform — Stripe, FCM, Twilio, etc."
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["key"]}
        statusKey="isActive"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => !!r.isActive },
          { label: "Inactive", value: "inactive", match: (r) => !r.isActive },
        ]}
        actionLabel="Add Config"
        onAction={openCreate}
        onRefresh={refetch}
        emptyMessage="No external configurations. Add your first key."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Configuration" : "Add Configuration"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ec-key">Key *</Label>
              <Input
                id="ec-key"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="GOOGLE_MAPS_API_KEY"
                disabled={!!editing}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ec-value">Value</Label>
              <Textarea
                id="ec-value"
                value={form.value ?? ""}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                rows={4}
                placeholder="Paste secret value here"
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Use this configuration in the app</p>
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
              {editing ? "Save Changes" : "Create Config"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
