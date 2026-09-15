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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Campaign {
  id: string;
  title: string;
  image: string | null;
  description: string | null;
  status: string;
  adminId: string | null;
  startDate: string;
  endDate: string;
  moduleId: string | null;
  slug: string | null;
}

const FALLBACK: Campaign[] = [
  {
    id: "fb-1",
    title: "Summer Pizza Fest",
    image: null,
    description: "Multi-channel campaign featuring seasonal pizzas and combo deals.",
    status: "running",
    adminId: null,
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    moduleId: null,
    slug: "summer-pizza-fest",
  },
  {
    id: "fb-2",
    title: "Burger Combo Launch",
    image: null,
    description: "Push-notification campaign for the new burger combo menu.",
    status: "running",
    adminId: null,
    startDate: "2025-07-15",
    endDate: "2025-09-15",
    moduleId: null,
    slug: "burger-combo-launch",
  },
  {
    id: "fb-3",
    title: "Healthy January",
    image: null,
    description: "Social media campaign promoting salads and healthy bowls.",
    status: "scheduled",
    adminId: null,
    startDate: "2025-08-10",
    endDate: "2025-08-31",
    moduleId: null,
    slug: "healthy-january",
  },
  {
    id: "fb-4",
    title: "Sushi Lover Promo",
    image: null,
    description: "Email drip campaign for sushi lovers (completed).",
    status: "completed",
    adminId: null,
    startDate: "2025-05-01",
    endDate: "2025-05-31",
    moduleId: null,
    slug: "sushi-lover-promo",
  },
  {
    id: "fb-5",
    title: "Diwali Sweets (Draft)",
    image: null,
    description: "Upcoming SMS + Email campaign for Diwali sweets delivery.",
    status: "draft",
    adminId: null,
    startDate: "2025-11-12",
    endDate: "2025-11-15",
    moduleId: null,
    slug: "diwali-sweets",
  },
];

const EMPTY = {
  title: "",
  image: "",
  description: "",
  status: "running",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  moduleId: "",
  slug: "",
};

export default function CampaignsPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Campaign>({
    endpoint: "/api/campaigns",
    realtimeTable: "campaigns",
    itemName: "Campaign",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      title: c.title,
      image: c.image ?? "",
      description: c.description ?? "",
      status: c.status || "running",
      startDate: (c.startDate || "").slice(0, 10),
      endDate: (c.endDate || "").slice(0, 10),
      moduleId: c.moduleId ?? "",
      slug: c.slug ?? "",
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
      image: form.image || null,
      description: form.description || null,
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      moduleId: form.moduleId || null,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-"),
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    setSaving(false);
    if (ok) setOpen(false);
  };

  const columns: Column<Campaign>[] = [
    {
      key: "title",
      header: "Campaign",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          {r.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.image}
              alt={r.title}
              className="w-10 h-10 rounded-lg object-cover border border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 text-xs font-bold">
              {r.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-foreground leading-tight">{r.title}</p>
            <p className="text-[11px] text-muted-foreground font-mono">/{r.slug || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (r) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-md">
          {r.description || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const map: Record<string, string> = {
          running: "bg-emerald-50 text-emerald-700 border-emerald-200",
          scheduled: "bg-blue-50 text-blue-700 border-blue-200",
          completed: "bg-gray-100 text-gray-600 border-gray-200",
          draft: "bg-gray-100 text-gray-600 border-gray-200",
        };
        const cls = map[r.status] || "bg-gray-100 text-gray-600 border-gray-200";
        const label = r.status
          ? r.status.charAt(0).toUpperCase() + r.status.slice(1)
          : "—";
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${cls}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {label}
          </span>
        );
      },
    },
    {
      key: "startDate",
      header: "Start Date",
      render: (r) => <span className="text-xs text-muted-foreground">{(r.startDate || "").slice(0, 10)}</span>,
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
          onView={() => toast.info(`Viewing ${r.title}`)}
          onEdit={() => openEdit(r)}
          onDelete={() => remove(r.id)}
        />
      ),
    },
  ];

  return (
    <>
      <CrudListTable<Campaign>
        title="Campaigns"
        description="Marketing campaigns across email, social, SMS and push"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["title", "description", "slug"]}
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Running", value: "running", match: (r) => r.status === "running" },
          { label: "Scheduled", value: "scheduled", match: (r) => r.status === "scheduled" },
          { label: "Draft", value: "draft", match: (r) => r.status === "draft" },
          { label: "Completed", value: "completed", match: (r) => r.status === "completed" },
        ]}
        actionLabel="New Campaign"
        onAction={openCreate}
        onRefresh={refetch}
        realtimeStatus="subscribed"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Campaign" : "New Campaign"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Summer Pizza Fest"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="summer-pizza-fest"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="col-span-2">
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://cdn.example.com/banner.jpg"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="moduleId">Module ID (optional)</Label>
              <Input
                id="moduleId"
                value={form.moduleId}
                onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
                placeholder="e.g. 1"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short summary of the campaign…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
