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

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImage?: string | null;
  isPublished: boolean;
  showInFooter: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const FALLBACK: CmsPage[] = [
  { id: "1", slug: "about-us", title: "About Us", body: "About our company...", isPublished: true, showInFooter: true, metaTitle: "About Us", metaDescription: "" },
  { id: "2", slug: "terms", title: "Terms & Conditions", body: "Terms of service...", isPublished: true, showInFooter: true, metaTitle: "Terms", metaDescription: "" },
  { id: "3", slug: "privacy", title: "Privacy Policy", body: "Privacy policy...", isPublished: true, showInFooter: true, metaTitle: "Privacy", metaDescription: "" },
  { id: "4", slug: "refund", title: "Refund Policy", body: "Refund policy...", isPublished: true, showInFooter: false, metaTitle: "Refunds", metaDescription: "" },
  { id: "5", slug: "faq", title: "FAQ", body: "Frequently asked questions...", isPublished: false, showInFooter: false, metaTitle: "FAQ", metaDescription: "" },
];

const EMPTY: CmsPage = {
  id: "",
  slug: "",
  title: "",
  body: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: true,
  showInFooter: false,
};

export default function PagesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<CmsPage>({
    endpoint: "/api/pages-cms",
    realtimeTable: "cms_pages",
    mapRow: (r) => ({
      id: String(r.id),
      slug: r.slug ?? "",
      title: r.title ?? "",
      body: r.body ?? null,
      metaTitle: r.metaTitle ?? null,
      metaDescription: r.metaDescription ?? null,
      metaImage: r.metaImage ?? null,
      isPublished: !!r.isPublished,
      showInFooter: !!r.showInFooter,
      createdAt: r.createdAt ?? null,
      updatedAt: r.updatedAt ?? null,
    }),
    itemName: "Page",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [form, setForm] = useState<CmsPage>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (p: CmsPage) => {
    setEditing(p);
    setForm({ ...p });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.slug.trim() || !form.title.trim()) return;
    const ok = editing
      ? await update(editing.id, {
          slug: form.slug,
          title: form.title,
          body: form.body,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          isPublished: form.isPublished,
          showInFooter: form.showInFooter,
        })
      : await create({
          slug: form.slug,
          title: form.title,
          body: form.body,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          isPublished: form.isPublished,
          showInFooter: form.showInFooter,
        });
    if (ok) setOpen(false);
  };

  const togglePublished = (p: CmsPage) =>
    update(p.id, { isPublished: !p.isPublished });

  const toggleFooter = (p: CmsPage) =>
    update(p.id, { showInFooter: !p.showInFooter });

  const columns: Column<CmsPage>[] = [
    { key: "id", header: "ID" },
    {
      key: "title",
      header: "Title",
      render: (r) => <span className="font-semibold text-foreground">{r.title}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      render: (r) => (
        <span className="inline-block px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-mono">
          /{r.slug}
        </span>
      ),
    },
    {
      key: "isPublished",
      header: "Published",
      align: "center",
      render: (r) => (
        <Switch checked={!!r.isPublished} onCheckedChange={() => togglePublished(r)} />
      ),
    },
    {
      key: "showInFooter",
      header: "Footer",
      align: "center",
      render: (r) => (
        <Switch checked={!!r.showInFooter} onCheckedChange={() => toggleFooter(r)} />
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
      <CrudListTable<CmsPage>
        title="Pages Setup"
        description="Manage static pages — About Us, Terms, Privacy Policy, Refund Policy, Contact, FAQs."
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["title", "slug"]}
        statusKey="isPublished"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Published", value: "published", match: (r) => !!r.isPublished },
          { label: "Draft", value: "draft", match: (r) => !r.isPublished },
          { label: "In Footer", value: "footer", match: (r) => !!r.showInFooter },
        ]}
        actionLabel="Add Page"
        onAction={openCreate}
        onRefresh={refetch}
        emptyMessage="No CMS pages yet. Create your first page."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Page" : "Add Page"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-title">Title *</Label>
              <Input
                id="p-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="About Us"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-slug">Slug *</Label>
              <Input
                id="p-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="about-us"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="p-body">Body</Label>
              <Textarea
                id="p-body"
                value={form.body ?? ""}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={8}
                placeholder="Page content (HTML or Markdown)..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-meta-title">Meta Title</Label>
              <Input
                id="p-meta-title"
                value={form.metaTitle ?? ""}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-meta-desc">Meta Description</Label>
              <Input
                id="p-meta-desc"
                value={form.metaDescription ?? ""}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Make this page live</p>
              </div>
              <Switch
                checked={form.isPublished}
                onCheckedChange={(c) => setForm({ ...form, isPublished: c })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Show in footer</p>
                <p className="text-xs text-muted-foreground">Display link in website footer</p>
              </div>
              <Switch
                checked={form.showInFooter}
                onCheckedChange={(c) => setForm({ ...form, showInFooter: c })}
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
              {editing ? "Save Changes" : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
