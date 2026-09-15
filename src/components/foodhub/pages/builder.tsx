"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LayoutTemplate, RefreshCw, Plus, Save, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  isPublished: boolean;
  showInFooter: boolean;
}

const FALLBACK_PAGES: CmsPage[] = [
  { id: "1", slug: "home", title: "Homepage", body: "<h1>Welcome to our store</h1>", isPublished: true, showInFooter: false },
  { id: "2", slug: "landing-promo", title: "Promo Landing", body: "<section>Summer sale live now</section>", isPublished: false, showInFooter: false },
  { id: "3", slug: "vendor-signup", title: "Vendor Signup", body: "<h2>Become a vendor</h2>", isPublished: true, showInFooter: true },
  { id: "4", slug: "delivery-boy-signup", title: "Delivery Boy Signup", body: "<h2>Drive with us</h2>", isPublished: true, showInFooter: true },
];

const EMPTY_PAGE: CmsPage = { id: "", slug: "", title: "", body: "", isPublished: false, showInFooter: false };

export default function BuilderPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CmsPage | null>(null);
  const [draft, setDraft] = useState<CmsPage>(EMPTY_PAGE);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages-cms", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.items ?? []);
      const mapped: CmsPage[] = arr.map((p: any) => ({
        id: String(p.id),
        slug: p.slug ?? "",
        title: p.title ?? "",
        body: p.body ?? "",
        isPublished: !!p.isPublished,
        showInFooter: !!p.showInFooter,
      }));
      setPages(mapped.length > 0 ? mapped : FALLBACK_PAGES);
    } catch {
      setPages(FALLBACK_PAGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const selectPage = (p: CmsPage) => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    setSelected(p);
    setDraft({ ...p });
    setDirty(false);
  };

  const updateDraft = (patch: Partial<CmsPage>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };

  const save = async () => {
    if (!draft.title.trim() || !draft.slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    try {
      const method = selected && !creating ? "PATCH" : "POST";
      const body: any = {
        slug: draft.slug,
        title: draft.title,
        body: draft.body,
        isPublished: draft.isPublished,
        showInFooter: draft.showInFooter,
      };
      if (selected && !creating) body.id = selected.id;
      const res = await fetch("/api/pages-cms", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(creating ? "Page created" : "Page saved");
      setDirty(false);
      setCreating(false);
      await fetchPages();
    } catch (e: any) {
      toast.error(`Failed to save: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const startCreate = () => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    setSelected(null);
    setCreating(true);
    setDraft({ ...EMPTY_PAGE, isPublished: true });
    setDirty(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Page Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit CMS pages and landing content. Click a page on the left to edit its body on the right.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPages}
          className="h-9 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center text-violet-700">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Page Builder</CardTitle>
                <CardDescription>Edit page content with HTML — title, slug, body, and SEO toggles.</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pages</CardTitle>
              <Button size="sm" variant="outline" onClick={startCreate} className="h-7 rounded-md text-xs">
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
                {creating && (
                  <button
                    className={`w-full text-left p-4 hover:bg-muted/30 transition-colors border-l-2 ${
                      !selected ? "border-primary bg-primary/5" : "border-transparent"
                    }`}
                  >
                    <p className="font-semibold text-primary text-sm">+ New Page</p>
                    <p className="text-xs text-muted-foreground">Create a new CMS page</p>
                  </button>
                )}
                {pages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPage(p)}
                    className={`w-full text-left p-4 hover:bg-muted/30 transition-colors border-l-2 ${
                      selected?.id === p.id ? "border-primary bg-primary/5" : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        {p.title}
                      </p>
                      {p.isPublished ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Published
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">/{p.slug}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white rounded-2xl border-[#E5E7EB] shadow-soft">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">
              {creating ? "New Page" : selected ? `Edit: ${selected.title}` : "Select a page to edit"}
            </CardTitle>
            {selected && (
              <CardDescription className="font-mono text-xs">/{selected.slug}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {creating || selected ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="b-title">Title</Label>
                    <Input
                      id="b-title"
                      value={draft.title}
                      onChange={(e) => updateDraft({ title: e.target.value })}
                      placeholder="Page title"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="b-slug">Slug</Label>
                    <Input
                      id="b-slug"
                      value={draft.slug}
                      onChange={(e) => updateDraft({ slug: e.target.value })}
                      placeholder="page-slug"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-body">Body (HTML)</Label>
                  <Textarea
                    id="b-body"
                    value={draft.body ?? ""}
                    onChange={(e) => updateDraft({ body: e.target.value })}
                    rows={12}
                    placeholder="<h1>Page content...</h1>"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.isPublished}
                      onChange={(e) => updateDraft({ isPublished: e.target.checked })}
                      className="rounded"
                    />
                    Published
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.showInFooter}
                      onChange={(e) => updateDraft({ showInFooter: e.target.checked })}
                      className="rounded"
                    />
                    Show in footer
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreating(false);
                      setSelected(null);
                      setDirty(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90 text-white"
                    onClick={save}
                    disabled={saving || !dirty}
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    {creating ? "Create Page" : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <LayoutTemplate className="w-10 h-10 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-3">
                  Select a page on the left to start editing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
