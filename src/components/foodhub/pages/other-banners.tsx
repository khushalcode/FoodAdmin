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

interface OtherBanner {
  id: string;
  title: string;
  subTitle: string | null;
  image: string | null;
  status: boolean;
  createdAt: string;
}

const FALLBACK: OtherBanner[] = [
  {
    id: "fb-1",
    title: "Restaurant Spotlight",
    subTitle: "Featured partner of the week",
    image: null,
    status: true,
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "fb-2",
    title: "Delivery App Banner",
    subTitle: "Track your order in real-time",
    image: null,
    status: true,
    createdAt: "2025-11-12T10:00:00Z",
  },
  {
    id: "fb-3",
    title: "Sidebar Promo",
    subTitle: "Save 20% on your next order",
    image: null,
    status: true,
    createdAt: "2025-11-08T10:00:00Z",
  },
  {
    id: "fb-4",
    title: "Mobile Splash",
    subTitle: "New: Pro Customers get free delivery",
    image: null,
    status: false,
    createdAt: "2025-11-05T10:00:00Z",
  },
];

const EMPTY = {
  title: "",
  subTitle: "",
  image: "",
  status: true,
};

export default function OtherBannersPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<OtherBanner>({
    endpoint: "/api/other-banners",
    realtimeTable: "admin_promotional_banners",
    itemName: "Banner",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OtherBanner | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  };

  const openEdit = (b: OtherBanner) => {
    setEditing(b);
    setForm({
      title: b.title,
      subTitle: b.subTitle ?? "",
      image: b.image ?? "",
      status: b.status,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      subTitle: form.subTitle || null,
      image: form.image || null,
      status: form.status,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    setSaving(false);
    if (ok) setOpen(false);
  };

  const columns: Column<OtherBanner>[] = [
    {
      key: "title",
      header: "Banner",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          {r.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.image}
              alt={r.title}
              className="w-14 h-9 rounded-md object-cover border border-border"
            />
          ) : (
            <div className="w-14 h-9 rounded-md bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100 flex items-center justify-center text-violet-500 text-xs">
              ⭐
            </div>
          )}
          <span className="font-semibold text-foreground">{r.title}</span>
        </div>
      ),
    },
    {
      key: "subTitle",
      header: "Subtitle",
      render: (r) => (
        <span className="text-sm text-muted-foreground">{r.subTitle || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <button
          onClick={() => update(r.id, { status: !r.status })}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
            r.status
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
          }`}
          title={r.status ? "Click to disable" : "Click to enable"}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {r.status ? "Published" : "Draft"}
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
      <CrudListTable<OtherBanner>
        title="Other Banners"
        description="Secondary banners for restaurant pages, app splash, and more"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["title", "subTitle"]}
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Published", value: "published", match: (r) => r.status === true },
          { label: "Draft", value: "draft", match: (r) => r.status === false },
        ]}
        actionLabel="Add Banner"
        onAction={openCreate}
        onRefresh={refetch}
        realtimeStatus="subscribed"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "Add Banner"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Restaurant Spotlight"
              />
            </div>
            <div>
              <Label htmlFor="subTitle">Subtitle</Label>
              <Input
                id="subTitle"
                value={form.subTitle}
                onChange={(e) => setForm({ ...form, subTitle: e.target.value })}
                placeholder="Featured partner of the week"
              />
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://cdn.example.com/banner.jpg"
              />
              {form.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt="preview"
                  className="mt-2 h-24 w-full object-cover rounded-lg border border-border"
                />
              )}
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="status">Published</Label>
                <p className="text-xs text-muted-foreground">Toggle visibility on the storefront</p>
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
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
