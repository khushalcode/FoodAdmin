"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Package, RefreshCw, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { TableActionButtons } from "../shared/list-page";

interface Module {
  id: string;
  moduleName: string;
  moduleType: string;
  status: boolean;
  defaultModule: boolean;
}

interface Category {
  id: string;
  name: string;
  image: string | null;
  parentId: string | null;
  moduleId: string | null;
  priority: number;
  status: boolean;
  slug: string | null;
  featured: boolean;
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: "1", name: "Documents", image: null, parentId: null, moduleId: "parcel", priority: 1, status: true, slug: "documents", featured: false },
  { id: "2", name: "Electronics", image: null, parentId: null, moduleId: "parcel", priority: 2, status: true, slug: "electronics", featured: true },
  { id: "3", name: "Clothing", image: null, parentId: null, moduleId: "parcel", priority: 3, status: true, slug: "clothing", featured: false },
  { id: "4", name: "Food Items", image: null, parentId: null, moduleId: "parcel", priority: 4, status: false, slug: "food-items", featured: false },
  { id: "5", name: "Fragile Goods", image: null, parentId: null, moduleId: "parcel", priority: 5, status: true, slug: "fragile-goods", featured: true },
];

export default function ParcelCategoriesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);

  const fetchModules = async () => {
    setModulesLoading(true);
    try {
      const res = await fetch("/api/modules", { cache: "no-store" });
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.items ?? []);
      setModules(
        arr.map((m: any) => ({
          id: String(m.id),
          moduleName: m.moduleName ?? "",
          moduleType: m.moduleType ?? "",
          status: m.status ?? false,
          defaultModule: !!m.defaultModule,
        })),
      );
    } catch {
      setModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  const fetchCategories = async (parcelModuleId: string | null) => {
    if (!parcelModuleId) {
      setCategories([]);
      setCatsLoading(false);
      return;
    }
    setCatsLoading(true);
    try {
      const res = await fetch(`/api/categories?moduleId=${encodeURIComponent(parcelModuleId)}`, { cache: "no-store" });
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.items ?? []);
      const mapped = arr.map((c: any) => ({
        id: String(c.id),
        name: c.name ?? "",
        image: c.image ?? null,
        parentId: c.parentId ?? null,
        moduleId: c.moduleId ? String(c.moduleId) : null,
        priority: c.priority ?? 0,
        status: c.status ?? true,
        slug: c.slug ?? null,
        featured: !!c.featured,
      }));
      setCategories(mapped.length > 0 ? mapped : FALLBACK_CATEGORIES);
    } catch {
      setCategories(FALLBACK_CATEGORIES);
    } finally {
      setCatsLoading(false);
    }
  };

  const updateCategory = async (id: string, patch: Partial<Category>) => {
    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Category updated");
      const parcel = modules.find((m) => (m.moduleType || "").toLowerCase() === "parcel");
      fetchCategories(parcel?.id ?? null);
    } catch (e: any) {
      toast.error(`Failed to update: ${e.message}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Category deleted");
      const parcel = modules.find((m) => (m.moduleType || "").toLowerCase() === "parcel");
      fetchCategories(parcel?.id ?? null);
    } catch (e: any) {
      toast.error(`Failed to delete: ${e.message}`);
    }
  };

  const enableParcelModule = async () => {
    const parcel = modules.find((m) => (m.moduleType || "").toLowerCase() === "parcel");
    if (!parcel) {
      try {
        const res = await fetch("/api/modules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleName: "Parcel", moduleType: "parcel", status: true, defaultModule: false }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        toast.success("Parcel module created & enabled");
        await fetchModules();
      } catch (e: any) {
        toast.error(`Failed to enable: ${e.message}`);
      }
      return;
    }
    const res = await fetch("/api/modules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parcel.id, status: true }),
    });
    if (!res.ok) {
      toast.error("Failed to enable Parcel module");
      return;
    }
    toast.success("Parcel module enabled");
    await fetchModules();
  };

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (modulesLoading) return;
    const parcel = modules.find((m) => (m.moduleType || "").toLowerCase() === "parcel");
    if (parcel?.status) {
      fetchCategories(parcel.id);
    } else {
      setCatsLoading(false);
      setCategories([]);
    }
  }, [modules, modulesLoading]);

  const parcelModule = modules.find((m) => (m.moduleType || "").toLowerCase() === "parcel");
  const moduleEnabled = !!parcelModule?.status;

  const refresh = () => {
    fetchModules();
    const parcel = modules.find((m) => (m.moduleType || "").toLowerCase() === "parcel");
    fetchCategories(parcel?.id ?? null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parcel Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Categories used by the parcel module — Documents, Electronics, Clothing, etc.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          className="h-9 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {!moduleEnabled ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-amber-700 mb-4">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Parcel module is not enabled</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Enable the Parcel module to manage parcel delivery categories. Once enabled, you can categorize shipments as Documents, Electronics, etc.
              </p>
              <Button
                className="mt-5 bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90 text-white"
                onClick={enableParcelModule}
                disabled={modulesLoading}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Enable Parcel Module
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft overflow-hidden">
          <CardContent className="px-0">
            {catsLoading ? (
              <div className="p-5 space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No parcel categories yet. Add categories with module set to parcel.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="text-left px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Slug</th>
                    <th className="text-center px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Featured</th>
                    <th className="text-center px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Active</th>
                    <th className="text-right px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.04, 0.3) }}
                      className="border-t border-border hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{c.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                        {c.slug || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Switch
                          checked={!!c.featured}
                          onCheckedChange={() => updateCategory(c.id, { featured: !c.featured })}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Switch
                          checked={!!c.status}
                          onCheckedChange={() => updateCategory(c.id, { status: !c.status })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <TableActionButtons onDelete={() => deleteCategory(c.id)} />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
