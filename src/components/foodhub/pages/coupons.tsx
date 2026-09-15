"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Coupon {
  id: string;
  title: string;
  code: string;
  discountType: "percentage" | "amount";
  discount: number;
  minPurchase: number;
  maxDiscount: number;
  couponType: string;
  limit: number | null;
  used: number;
  startDate: string;
  endDate: string;
  status: boolean;
  moduleId: string | null;
  storeId: string | null;
}

const FALLBACK: Coupon[] = [
  {
    id: "fb-1",
    title: "Welcome 10% off",
    code: "WELCOME10",
    discountType: "percentage",
    discount: 10,
    minPurchase: 0,
    maxDiscount: 50,
    couponType: "default",
    limit: 1000,
    used: 412,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: true,
    moduleId: null,
    storeId: null,
  },
  {
    id: "fb-2",
    title: "$5 off any pizza",
    code: "PIZZA50",
    discountType: "amount",
    discount: 5,
    minPurchase: 20,
    maxDiscount: 0,
    couponType: "default",
    limit: 500,
    used: 318,
    startDate: "2025-02-01",
    endDate: "2025-11-30",
    status: true,
    moduleId: null,
    storeId: null,
  },
  {
    id: "fb-3",
    title: "Weekend 25% off",
    code: "WEEKEND25",
    discountType: "percentage",
    discount: 25,
    minPurchase: 30,
    maxDiscount: 30,
    couponType: "default",
    limit: 300,
    used: 156,
    startDate: "2025-03-01",
    endDate: "2025-11-25",
    status: true,
    moduleId: null,
    storeId: null,
  },
  {
    id: "fb-4",
    title: "Expired sushi offer",
    code: "SUSHI15",
    discountType: "percentage",
    discount: 15,
    minPurchase: 25,
    maxDiscount: 20,
    couponType: "default",
    limit: 200,
    used: 89,
    startDate: "2024-09-01",
    endDate: "2024-11-10",
    status: false,
    moduleId: null,
    storeId: null,
  },
  {
    id: "fb-5",
    title: "Big order 30% off",
    code: "BIGORDER30",
    discountType: "percentage",
    discount: 30,
    minPurchase: 50,
    maxDiscount: 60,
    couponType: "default",
    limit: 500,
    used: 234,
    startDate: "2025-04-15",
    endDate: "2025-12-31",
    status: true,
    moduleId: null,
    storeId: null,
  },
];

const EMPTY: Omit<Coupon, "id" | "used"> = {
  title: "",
  code: "",
  discountType: "percentage",
  discount: 0,
  minPurchase: 0,
  maxDiscount: 0,
  couponType: "default",
  limit: 100,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  status: true,
  moduleId: null,
  storeId: null,
};

export default function CouponsPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Coupon>({
    endpoint: "/api/coupons",
    realtimeTable: "coupons",
    itemName: "Coupon",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      title: c.title,
      code: c.code,
      discountType: c.discountType,
      discount: c.discount,
      minPurchase: c.minPurchase,
      maxDiscount: c.maxDiscount,
      couponType: c.couponType,
      limit: c.limit ?? 100,
      startDate: (c.startDate || "").slice(0, 10),
      endDate: (c.endDate || "").slice(0, 10),
      status: c.status,
      moduleId: c.moduleId,
      storeId: c.storeId,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title || !form.code || form.discount === undefined) {
      toast.error("Title, code and discount are required");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      discount: Number(form.discount),
      minPurchase: Number(form.minPurchase),
      maxDiscount: Number(form.maxDiscount),
      limit: form.limit ? Number(form.limit) : null,
    };
    const ok = editing
      ? await update(editing.id, payload)
      : await create(payload);
    setSaving(false);
    if (ok) {
      setOpen(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Code "${code}" copied to clipboard`);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const columns: Column<Coupon>[] = [
    {
      key: "code",
      header: "Code",
      render: (r) => (
        <button
          onClick={() => copyCode(r.code)}
          className="inline-flex items-center gap-1.5 font-mono font-semibold text-primary bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md text-xs transition-colors"
          title="Copy code"
        >
          {r.code}
          <Copy className="w-3 h-3" />
        </button>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (r) => <span className="font-medium text-foreground">{r.title}</span>,
    },
    {
      key: "discount",
      header: "Discount",
      align: "right",
      render: (r) => (
        <span className="font-semibold text-emerald-600">
          {r.discountType === "percentage" ? `${r.discount}%` : `$${Number(r.discount).toFixed(2)}`}
        </span>
      ),
    },
    {
      key: "minPurchase",
      header: "Min Purchase",
      align: "right",
      render: (r) => <span className="text-muted-foreground">${Number(r.minPurchase).toFixed(2)}</span>,
    },
    {
      key: "used",
      header: "Used / Limit",
      align: "right",
      render: (r) => (
        <span className="text-muted-foreground">
          {r.used} / {r.limit ?? "∞"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
            r.status
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {r.status ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "endDate",
      header: "End Date",
      render: (r) => <span className="text-xs text-muted-foreground">{(r.endDate || "").slice(0, 10)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <TableActionButtons
          onView={() => toast.info(`Viewing ${r.code}`)}
          onEdit={() => openEdit(r)}
          onDelete={() => remove(r.id)}
        />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<Coupon>
        title="Coupons"
        description="Discount codes customers can apply at checkout"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["code", "title"]}
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => r.status === true },
          { label: "Inactive", value: "inactive", match: (r) => r.status === false },
        ]}
        actionLabel="Create Coupon"
        onAction={openCreate}
        onRefresh={refetch}
        realtimeStatus="subscribed"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Summer Sale 10% Off"
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER10"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="couponType">Coupon Type</Label>
              <Select
                value={form.couponType}
                onValueChange={(v) => setForm({ ...form, couponType: v })}
              >
                <SelectTrigger id="couponType">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="first_order">First Order</SelectItem>
                  <SelectItem value="free_delivery">Free Delivery</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discountType">Discount Type</Label>
              <Select
                value={form.discountType}
                onValueChange={(v: any) => setForm({ ...form, discountType: v })}
              >
                <SelectTrigger id="discountType">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="amount">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="minPurchase">Min Purchase ($)</Label>
              <Input
                id="minPurchase"
                type="number"
                value={form.minPurchase}
                onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="maxDiscount">Max Discount ($)</Label>
              <Input
                id="maxDiscount"
                type="number"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="limit">Usage Limit (blank = unlimited)</Label>
              <Input
                id="limit"
                type="number"
                value={form.limit ?? ""}
                onChange={(e) =>
                  setForm({ ...form, limit: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="moduleId">Module ID (optional)</Label>
              <Input
                id="moduleId"
                value={form.moduleId ?? ""}
                onChange={(e) =>
                  setForm({ ...form, moduleId: e.target.value || null })
                }
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <Label htmlFor="storeId">Store ID (optional)</Label>
              <Input
                id="storeId"
                value={form.storeId ?? ""}
                onChange={(e) =>
                  setForm({ ...form, storeId: e.target.value || null })
                }
                placeholder="e.g. 5"
              />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="status">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive coupons are not redeemable at checkout
                </p>
              </div>
              <Switch
                id="status"
                checked={form.status}
                onCheckedChange={(v) => setForm({ ...form, status: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
