"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CrudListTable, type Column } from "../shared/crud-list-table";
import { TableActionButtons } from "../shared/list-page";
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

interface FlashSale {
  id: string;
  title: string;
  moduleId: string | null;
  adminDiscountPercentage: number;
  vendorDiscountPercentage: number;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  slug: string | null;
  createdAt: string;
}

const FALLBACK: FlashSale[] = [
  {
    id: "fb-1",
    title: "Flash Friday Pizza",
    moduleId: null,
    adminDiscountPercentage: 20,
    vendorDiscountPercentage: 11,
    startDate: "2025-11-21T12:00:00Z",
    endDate: "2025-11-21T16:00:00Z",
    isPublished: true,
    slug: "flash-friday-pizza",
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "fb-2",
    title: "Sushi Sunday Special",
    moduleId: null,
    adminDiscountPercentage: 15,
    vendorDiscountPercentage: 14,
    startDate: "2025-11-23T18:00:00Z",
    endDate: "2025-11-23T23:00:00Z",
    isPublished: true,
    slug: "sushi-sunday-special",
    createdAt: "2025-11-10T10:00:00Z",
  },
  {
    id: "fb-3",
    title: "Burger Madness",
    moduleId: null,
    adminDiscountPercentage: 18,
    vendorDiscountPercentage: 12,
    startDate: "2025-11-25T11:00:00Z",
    endDate: "2025-11-25T15:00:00Z",
    isPublished: false,
    slug: "burger-madness",
    createdAt: "2025-11-05T10:00:00Z",
  },
  {
    id: "fb-4",
    title: "Curry Night",
    moduleId: null,
    adminDiscountPercentage: 25,
    vendorDiscountPercentage: 8,
    startDate: "2025-11-22T19:00:00Z",
    endDate: "2025-11-22T22:30:00Z",
    isPublished: true,
    slug: "curry-night",
    createdAt: "2025-11-08T10:00:00Z",
  },
];

const EMPTY = {
  title: "",
  moduleId: "",
  adminDiscountPercentage: 10,
  vendorDiscountPercentage: 10,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
  isPublished: true,
  slug: "",
};

export default function FlashSalesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<FlashSale>({
    endpoint: "/api/flash-sales",
    realtimeTable: "flash_sales",
    itemName: "Flash Sale",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FlashSale | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  };

  const openEdit = (s: FlashSale) => {
    setEditing(s);
    setForm({
      title: s.title,
      moduleId: s.moduleId ?? "",
      adminDiscountPercentage: s.adminDiscountPercentage,
      vendorDiscountPercentage: s.vendorDiscountPercentage,
      startDate: (s.startDate || "").slice(0, 16),
      endDate: (s.endDate || "").slice(0, 16),
      isPublished: s.isPublished,
      slug: s.slug ?? "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload: Partial<FlashSale> = {
      title: form.title,
      moduleId: form.moduleId || null,
      adminDiscountPercentage: Number(form.adminDiscountPercentage),
      vendorDiscountPercentage: Number(form.vendorDiscountPercentage),
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      isPublished: form.isPublished,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-"),
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    setSaving(false);
    if (ok) setOpen(false);
  };

  const fmtDate = (s: string) => {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: Column<FlashSale>[] = [
    {
      key: "title",
      header: "Title",
      render: (r) => (
        <div>
          <p className="font-semibold text-foreground">{r.title}</p>
          {r.slug && <p className="text-[11px] text-muted-foreground font-mono">/{r.slug}</p>}
        </div>
      ),
    },
    {
      key: "adminDiscountPercentage",
      header: "Admin %",
      align: "right",
      render: (r) => (
        <span className="font-semibold text-primary">{Number(r.adminDiscountPercentage)}%</span>
      ),
    },
    {
      key: "vendorDiscountPercentage",
      header: "Vendor %",
      align: "right",
      render: (r) => (
        <span className="font-semibold text-violet-600">{Number(r.vendorDiscountPercentage)}%</span>
      ),
    },
    {
      key: "startDate",
      header: "Start",
      render: (r) => <span className="text-xs text-muted-foreground">{fmtDate(r.startDate)}</span>,
    },
    {
      key: "endDate",
      header: "End",
      render: (r) => <span className="text-xs text-muted-foreground">{fmtDate(r.endDate)}</span>,
    },
    {
      key: "isPublished",
      header: "Published",
      align: "center",
      render: (r) => (
        <button
          onClick={() => update(r.id, { isPublished: !r.isPublished })}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
            r.isPublished
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
          }`}
          title={r.isPublished ? "Click to unpublish" : "Click to publish"}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {r.isPublished ? "Published" : "Hidden"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <TableActionButtons
          onView={() => toast.info(`Viewing ${r.title}`)}
          onEdit={() => openEdit(r)}
          onDelete={() => remove(r.id)}
        />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<FlashSale>
        title="Flash Sales"
        description="Time-limited promotions with deep discounts"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["title", "slug"]}
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Published", value: "published", match: (r) => r.isPublished === true },
          { label: "Hidden", value: "hidden", match: (r) => r.isPublished === false },
        ]}
        actionLabel="Create Flash Sale"
        onAction={openCreate}
        onRefresh={refetch}
        realtimeStatus="subscribed"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Flash Sale" : "Create Flash Sale"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Flash Friday Pizza"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="flash-friday-pizza"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="moduleId">Module ID (optional)</Label>
              <Input
                id="moduleId"
                value={form.moduleId}
                onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <Label htmlFor="adminDiscountPercentage">Admin Discount (%)</Label>
              <Input
                id="adminDiscountPercentage"
                type="number"
                min={0}
                max={100}
                value={form.adminDiscountPercentage}
                onChange={(e) =>
                  setForm({ ...form, adminDiscountPercentage: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="vendorDiscountPercentage">Vendor Discount (%)</Label>
              <Input
                id="vendorDiscountPercentage"
                type="number"
                min={0}
                max={100}
                value={form.vendorDiscountPercentage}
                onChange={(e) =>
                  setForm({ ...form, vendorDiscountPercentage: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="isPublished">Published</Label>
                <p className="text-xs text-muted-foreground">
                  When published, customers will see this flash sale in the app
                </p>
              </div>
              <Switch
                id="isPublished"
                checked={form.isPublished}
                onCheckedChange={(v) => setForm({ ...form, isPublished: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Flash Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
