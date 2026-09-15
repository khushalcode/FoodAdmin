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

interface Language {
  id: string;
  code: string;
  name: string;
  direction: string;
  isActive: boolean;
  isDefault: boolean;
  flag?: string | null;
}

const FALLBACK: Language[] = [
  { id: "1", code: "en", name: "English", direction: "ltr", isActive: true, isDefault: true, flag: "🇬🇧" },
  { id: "2", code: "es", name: "Spanish", direction: "ltr", isActive: true, isDefault: false, flag: "🇪🇸" },
  { id: "3", code: "ar", name: "Arabic", direction: "rtl", isActive: true, isDefault: false, flag: "🇸🇦" },
  { id: "4", code: "fr", name: "French", direction: "ltr", isActive: true, isDefault: false, flag: "🇫🇷" },
  { id: "5", code: "hi", name: "Hindi", direction: "ltr", isActive: false, isDefault: false, flag: "🇮🇳" },
];

const EMPTY: Language = {
  id: "",
  code: "",
  name: "",
  direction: "ltr",
  isActive: true,
  isDefault: false,
  flag: "",
};

export default function LanguagesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Language>({
    endpoint: "/api/languages",
    realtimeTable: "languages",
    mapRow: (r) => ({
      id: String(r.id),
      code: r.code ?? "",
      name: r.name ?? "",
      direction: r.direction ?? "ltr",
      isActive: !!r.isActive,
      isDefault: !!r.isDefault,
      flag: r.flag ?? null,
    }),
    itemName: "Language",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);
  const [form, setForm] = useState<Language>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (l: Language) => {
    setEditing(l);
    setForm({ ...l });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    const ok = editing
      ? await update(editing.id, {
          name: form.name,
          direction: form.direction,
          isActive: form.isActive,
          isDefault: form.isDefault,
          flag: form.flag,
        })
      : await create({
          code: form.code,
          name: form.name,
          direction: form.direction,
          isActive: form.isActive,
          isDefault: form.isDefault,
          flag: form.flag,
        });
    if (ok) setOpen(false);
  };

  const toggleActive = (l: Language) =>
    update(l.id, { isActive: !l.isActive });

  const toggleDefault = (l: Language) =>
    update(l.id, { isDefault: !l.isDefault });

  const columns: Column<Language>[] = [
    {
      key: "code",
      header: "Code",
      render: (r) => (
        <span className="inline-block px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-mono font-medium">
          {r.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <span className="font-semibold text-foreground inline-flex items-center gap-2">
          {r.flag && <span>{r.flag}</span>}
          {r.name}
        </span>
      ),
    },
    {
      key: "direction",
      header: "Direction",
      render: (r) => (
        <span className="uppercase text-xs text-muted-foreground">{r.direction}</span>
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
      key: "isDefault",
      header: "Default",
      align: "center",
      render: (r) => (
        <Switch checked={!!r.isDefault} onCheckedChange={() => toggleDefault(r)} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <TableActionButtons
          onEdit={() => openEdit(r)}
          onDelete={r.isDefault ? undefined : () => remove(r.id)}
        />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<Language>
        title="Languages"
        description="Manage supported languages and localize UI strings for customers, vendors, and delivery boys."
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["code", "name"]}
        statusKey="isActive"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => !!r.isActive },
          { label: "RTL", value: "rtl", match: (r) => r.direction === "rtl" },
          { label: "Default", value: "default", match: (r) => !!r.isDefault },
        ]}
        actionLabel="Add Language"
        onAction={openCreate}
        onRefresh={refetch}
        emptyMessage="No languages configured. Add a language."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Language" : "Add Language"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="l-code">Code *</Label>
              <Input
                id="l-code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="en, es, ar..."
                disabled={!!editing}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-name">Name *</Label>
              <Input
                id="l-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="English"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-dir">Direction</Label>
              <select
                id="l-dir"
                value={form.direction}
                onChange={(e) => setForm({ ...form, direction: e.target.value })}
                className="w-full h-9 rounded-md border bg-transparent px-3 text-sm"
              >
                <option value="ltr">LTR (Left-to-Right)</option>
                <option value="rtl">RTL (Right-to-Left)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-flag">Flag emoji</Label>
              <Input
                id="l-flag"
                value={form.flag ?? ""}
                onChange={(e) => setForm({ ...form, flag: e.target.value })}
                placeholder="🇬🇧"
              />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Make this language available</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(c) => setForm({ ...form, isActive: c })}
              />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Default</p>
                <p className="text-xs text-muted-foreground">Used as fallback when locale isn't set</p>
              </div>
              <Switch
                checked={form.isDefault}
                onCheckedChange={(c) => setForm({ ...form, isDefault: c })}
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
              {editing ? "Save Changes" : "Create Language"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
