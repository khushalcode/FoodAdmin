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

interface Reel {
  id: string;
  title: string | null;
  description?: string | null;
  videoUrl?: string | null;
  video?: string | null;
  thumbnail?: string | null;
  status: boolean;
}

const FALLBACK: Reel[] = [
  { id: "1", title: "Summer BBQ Special", description: "Hot grills, fresh burgers", videoUrl: "/videos/bbq.mp4", thumbnail: "/thumbnails/bbq.jpg", status: true },
  { id: "2", title: "Pizza Night", description: "Cheesy pizzas from your favorite places", videoUrl: "/videos/pizza.mp4", thumbnail: "/thumbnails/pizza.jpg", status: true },
  { id: "3", title: "Healthy Smoothies", description: "Fresh fruit smoothies for summer", videoUrl: "/videos/smoothie.mp4", thumbnail: "/thumbnails/smoothie.jpg", status: true },
  { id: "4", title: "Coffee Lovers", description: "Baristas in action", videoUrl: "/videos/coffee.mp4", thumbnail: "/thumbnails/coffee.jpg", status: false },
  { id: "5", title: "Dessert Heaven", description: "Sweet treats to satisfy cravings", videoUrl: "/videos/dessert.mp4", thumbnail: "/thumbnails/dessert.jpg", status: true },
];

const EMPTY: Reel = {
  id: "",
  title: "",
  description: "",
  videoUrl: "",
  thumbnail: "",
  status: true,
};

export default function ReelsPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Reel>({
    endpoint: "/api/reels",
    realtimeTable: "reels",
    mapRow: (r) => ({
      id: String(r.id),
      title: r.title ?? null,
      description: r.description ?? null,
      videoUrl: r.videoUrl ?? r.video ?? null,
      video: r.video ?? null,
      thumbnail: r.thumbnail ?? null,
      status: r.status ?? true,
    }),
    itemName: "Reel",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reel | null>(null);
  const [form, setForm] = useState<Reel>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (r: Reel) => {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title?.trim()) return;
    const payload: Partial<Reel> = {
      title: form.title,
      description: form.description,
      videoUrl: form.videoUrl,
      thumbnail: form.thumbnail,
      status: form.status,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (ok) setOpen(false);
  };

  const toggleStatus = (r: Reel) =>
    update(r.id, { status: !r.status });

  const columns: Column<Reel>[] = [
    { key: "id", header: "ID" },
    {
      key: "thumbnail",
      header: "Thumbnail",
      render: (r) => (
        <div className="w-12 h-16 rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center">
          {r.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.thumbnail} alt={r.title || "reel"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted-foreground">No img</span>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (r) => (
        <div>
          <p className="font-semibold text-foreground">{r.title || "Untitled"}</p>
          {r.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
              {r.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "videoUrl",
      header: "Video",
      render: (r) => (
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[160px] block">
          {r.videoUrl || "—"}
        </span>
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
      <CrudListTable<Reel>
        title="Reels"
        description="Short-form video content shown in the customer app feed."
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["title", "description"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => !!r.status },
          { label: "Inactive", value: "inactive", match: (r) => !r.status },
        ]}
        actionLabel="Add Reel"
        onAction={openCreate}
        onRefresh={refetch}
        emptyMessage="No reels yet. Upload your first reel."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Reel" : "Add Reel"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="r-title">Title *</Label>
              <Input
                id="r-title"
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Summer BBQ Special"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-desc">Description</Label>
              <Textarea
                id="r-desc"
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Short caption for this reel"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="r-video">Video URL</Label>
                <Input
                  id="r-video"
                  value={form.videoUrl ?? ""}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://.../video.mp4"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="r-thumb">Thumbnail URL</Label>
                <Input
                  id="r-thumb"
                  value={form.thumbnail ?? ""}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  placeholder="https://.../thumb.jpg"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Show this reel in the feed</p>
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
              {editing ? "Save Changes" : "Create Reel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
