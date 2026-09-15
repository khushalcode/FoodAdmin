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
import { Badge } from "@/components/ui/badge";

interface Attribute {
  id: string;
  name: string;
  values: string[];
}

const FALLBACK: Attribute[] = [
  { id: "fb-1", name: "Size", values: ["Small", "Medium", "Large", "XL"] },
  { id: "fb-2", name: "Spice Level", values: ["Mild", "Medium", "Hot", "Extra Hot"] },
  { id: "fb-3", name: "Crust Type", values: ["Thin", "Regular", "Stuffed", "Gluten-Free"] },
  { id: "fb-4", name: "Toppings", values: ["Cheese", "Olives", "Mushrooms", "Peppers"] },
];

export default function AttributesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Attribute>({
    endpoint: "/api/attributes",
    realtimeTable: "attributes",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name,
      values: Array.isArray(r.values) ? r.values : [],
    }),
    itemName: "Attribute",
    fallback: FALLBACK,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Attribute | null>(null);
  const [form, setForm] = useState<{ name?: string; valuesText?: string }>({});

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", valuesText: "" });
    setDialogOpen(true);
  };

  const openEdit = (a: Attribute) => {
    setEditing(a);
    setForm({ name: a.name, valuesText: (a.values || []).join(", ") });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name) {
      toast.error("Attribute name is required");
      return;
    }
    const values = (form.valuesText || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (values.length === 0) {
      toast.error("Add at least one value");
      return;
    }
    const payload = { name: form.name, values };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (ok) setDialogOpen(false);
  };

  const onDelete = async (a: Attribute) => {
    if (!confirm(`Delete attribute "${a.name}"?`)) return;
    await remove(a.id);
  };

  const columns: Column<Attribute>[] = [
    { key: "id", header: "ID", render: (r) => <span className="text-muted-foreground text-xs">#{r.id}</span> },
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-semibold text-foreground">{r.name}</span>,
    },
    {
      key: "values",
      header: "Values",
      render: (r) => (
        <div className="flex flex-wrap gap-1 max-w-md">
          {(r.values || []).slice(0, 6).map((v, i) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 text-[11px] font-medium"
            >
              {v}
            </Badge>
          ))}
          {(r.values || []).length > 6 && (
            <span className="text-[11px] text-muted-foreground self-center">
              +{r.values.length - 6} more
            </span>
          )}
          {(!r.values || r.values.length === 0) && (
            <span className="text-[11px] italic text-muted-foreground">No values</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: () => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          Active
        </span>
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
      <CrudListTable<Attribute>
        title="Attributes"
        description="Define customization attributes for dishes (size, toppings, spice level…)"
        items={items}
        loading={loading}
        onRefresh={refetch}
        actionLabel="Add Attribute"
        onAction={openCreate}
        searchKeys={["name"]}
        columns={columns}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Attribute" : "Add Attribute"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Attribute Name</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Size, Toppings, Spice Level"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Values (comma-separated)</Label>
              <Input
                value={form.valuesText || ""}
                onChange={(e) => setForm({ ...form, valuesText: e.target.value })}
                placeholder="Small, Medium, Large, XL"
              />
              <p className="text-[11px] text-muted-foreground">
                Split on commas — leading/trailing spaces are trimmed on save.
              </p>
              {form.valuesText && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {form.valuesText
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean)
                    .map((v, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 text-[11px]"
                      >
                        {v}
                      </Badge>
                    ))}
                </div>
              )}
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
              {editing ? "Save Changes" : "Create Attribute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
