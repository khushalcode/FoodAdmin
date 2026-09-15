"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff, Star, ExternalLink } from "lucide-react";
import { PageHeader, ContentCard, StatusBadge, GridSkeleton } from "../shared/list-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRealtimeTable } from "@/hooks/use-realtime";

interface Banner {
  id: string;
  title: string;
  type: string;
  image: string;
  url?: string;
  redirectLink?: string;
  status: boolean;
  featured: boolean;
  moduleId?: string;
  zoneId?: string;
  backgroundColor?: string;
  startDate?: string;
  endDate?: string;
}

const FALLBACK: Banner[] = [
  { id: "fb-1", title: "Summer Sale — 30% off", type: "web_url", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", redirectLink: "/offers", status: true, featured: true, backgroundColor: "#7C5CFF" },
  { id: "fb-2", title: "Free Delivery Weekend", type: "web_url", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400", redirectLink: "/offers", status: true, featured: false, backgroundColor: "#C026D3" },
];

export default function BannersPage() {
  const [data, setData] = useState<Banner[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<Partial<Banner>>({});

  const refetch = async () => {
    try {
      const res = await fetch("/api/banners", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.length > 0 ? json : FALLBACK);
    } catch (e) {
      setData(FALLBACK);
      toast.error("Failed to load banners — showing sample data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetch(); }, []);

  // Live updates — any banner INSERT/UPDATE/DELETE triggers refetch
  useRealtimeTable("banners", () => refetch());

  const openCreate = () => {
    setEditing(null);
    setForm({ status: true, featured: false, type: "web_url" });
    setDialogOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({ ...b });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.image) {
      toast.error("Title and image are required");
      return;
    }
    try {
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      toast.success(editing ? "Banner updated" : "Banner created — customer app will see it instantly");
      setDialogOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(`Save failed: ${e.message}`);
    }
  };

  const toggle = async (b: Banner) => {
    try {
      await fetch("/api/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, status: !b.status }),
      });
      toast.success(`Banner ${!b.status ? "published" : "hidden"}`);
      refetch();
    } catch (e: any) {
      toast.error(`Toggle failed: ${e.message}`);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner? Customer app will no longer show it.")) return;
    try {
      await fetch(`/api/banners?id=${id}`, { method: "DELETE" });
      toast.success("Banner deleted");
      refetch();
    } catch (e: any) {
      toast.error(`Delete failed: ${e.message}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Banners"
        description="Promotional banners shown across the customer app (realtime-synced)"
        actionLabel="Add Banner"
        onAction={openCreate}
      />

      {loading ? (
        <GridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data || FALLBACK).map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <ContentCard className="overflow-hidden h-full">
                <div
                  className="relative h-36 flex items-center p-5 overflow-hidden"
                  style={{ background: b.backgroundColor ? `linear-gradient(135deg, ${b.backgroundColor} 0%, #C026D3 100%)` : "linear-gradient(135deg, #7C5CFF 0%, #C026D3 100%)" }}
                >
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
                  <div className="absolute -right-12 -bottom-8 w-24 h-24 rounded-full bg-white/10" />
                  <div className="relative z-10 text-white max-w-[70%]">
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur text-[10px] uppercase tracking-wide mb-1.5">
                      {b.featured ? "Featured" : b.type}
                    </Badge>
                    <h3 className="text-xl font-bold leading-tight">{b.title}</h3>
                    {b.redirectLink && (
                      <a
                        href={b.redirectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-white/80 hover:text-white"
                      >
                        {b.redirectLink} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {b.image && (
                    <img
                      src={b.image}
                      alt={b.title}
                      className="absolute right-2 top-2 w-24 h-24 rounded-lg object-cover border-2 border-white/30 shadow-lg"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  )}
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={b.status} onCheckedChange={() => toggle(b)} />
                    <span className="text-xs text-muted-foreground">{b.status ? "Published" : "Hidden"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(b)} className="h-8 w-8 p-0">
                      <Plus className="w-3.5 h-3.5 rotate-45" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(b.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </ContentCard>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "Add Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summer Sale — 30% off" />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://images.unsplash.com/..." />
            </div>
            <div className="space-y-1.5">
              <Label>Redirect Link</Label>
              <Input value={form.redirectLink || ""} onChange={(e) => setForm({ ...form, redirectLink: e.target.value })} placeholder="/offers" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.type || "web_url"}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="web_url">Web URL</option>
                  <option value="store">Store</option>
                  <option value="item">Item</option>
                  <option value="category">Category</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Background color</Label>
                <Input value={form.backgroundColor || ""} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })} placeholder="#7C5CFF" />
              </div>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.status ?? true} onCheckedChange={(v) => setForm({ ...form, status: v })} />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.featured ?? false} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90">
              {editing ? "Save Changes" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
