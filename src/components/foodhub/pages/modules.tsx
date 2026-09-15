"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Utensils,
  ShoppingCart,
  Pill,
  Store,
  Package,
  Car,
  Bike,
  Puzzle,
  RefreshCw,
} from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface Module {
  id: string;
  moduleName: string;
  moduleType: string;
  status: boolean;
  defaultModule: boolean;
}

const ICON_MAP: Record<string, any> = {
  food: Utensils,
  grocery: ShoppingCart,
  pharmacy: Pill,
  shop: Store,
  parcel: Package,
  rental: Car,
  "ride share": Bike,
  ride_share: Bike,
  rideshare: Bike,
  service: Puzzle,
};

const COLOR_MAP: Record<string, string> = {
  food: "from-orange-100 to-red-100 text-red-600",
  grocery: "from-green-100 to-emerald-100 text-emerald-600",
  pharmacy: "from-blue-100 to-cyan-100 text-cyan-600",
  shop: "from-violet-100 to-purple-100 text-violet-600",
  parcel: "from-amber-100 to-yellow-100 text-amber-600",
  rental: "from-pink-100 to-rose-100 text-rose-600",
  "ride share": "from-indigo-100 to-blue-100 text-indigo-600",
  ride_share: "from-indigo-100 to-blue-100 text-indigo-600",
  rideshare: "from-indigo-100 to-blue-100 text-indigo-600",
  service: "from-gray-100 to-slate-100 text-slate-600",
};

const FALLBACK: Module[] = [
  { id: "1", moduleName: "Food", moduleType: "food", status: true, defaultModule: true },
  { id: "2", moduleName: "Grocery", moduleType: "grocery", status: true, defaultModule: false },
  { id: "3", moduleName: "Pharmacy", moduleType: "pharmacy", status: true, defaultModule: false },
  { id: "4", moduleName: "Shop", moduleType: "shop", status: false, defaultModule: false },
  { id: "5", moduleName: "Parcel", moduleType: "parcel", status: false, defaultModule: false },
  { id: "6", moduleName: "Rental", moduleType: "rental", status: false, defaultModule: false },
  { id: "7", moduleName: "Ride Share", moduleType: "ride_share", status: false, defaultModule: false },
];

export default function ModulesPage() {
  const { items, loading, update, create, refetch } = useCrud<Module>({
    endpoint: "/api/modules",
    realtimeTable: "modules",
    mapRow: (r) => ({
      id: String(r.id),
      moduleName: r.moduleName ?? "",
      moduleType: r.moduleType ?? "food",
      status: r.status ?? false,
      defaultModule: !!r.defaultModule,
    }),
    itemName: "Module",
    fallback: FALLBACK,
  });

  const [creating, setCreating] = useState(false);

  const toggleStatus = (m: Module) =>
    update(m.id, { status: !m.status });

  const toggleDefault = (m: Module) => {
    update(m.id, { defaultModule: !m.defaultModule });
  };

  const ensureModuleExists = async (moduleType: string, moduleName: string) => {
    setCreating(true);
    const ok = await create({ moduleName, moduleType, status: true, defaultModule: false });
    setCreating(false);
    if (ok) toast.success(`${moduleName} module enabled`);
  };

  const modules = items || [];
  // Ensure all 7 canonical modules are shown even if API returns fewer.
  const canonicalTypes = ["food", "grocery", "pharmacy", "shop", "parcel", "rental", "ride_share"];
  const canonicalNames: Record<string, string> = {
    food: "Food",
    grocery: "Grocery",
    pharmacy: "Pharmacy",
    shop: "Shop",
    parcel: "Parcel",
    rental: "Rental",
    ride_share: "Ride Share",
  };
  const seen = new Set(modules.map((m) => (m.moduleType || "").toLowerCase()));
  const missing = canonicalTypes
    .filter((t) => !seen.has(t))
    .map((t) => ({ id: `pending-${t}`, moduleName: canonicalNames[t], moduleType: t, status: false, defaultModule: false }));

  const allModules = [...modules, ...missing];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modules</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all available business verticals — Food, Grocery, Pharmacy, Shop, Parcel, Rental, Ride Share.
          </p>
          <div className="text-xs text-muted-foreground mt-1.5">
            {modules.length} active · {missing.length} pending setup
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="h-9 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allModules.map((m, i) => {
            const type = (m.moduleType || "service").toLowerCase();
            const Icon = ICON_MAP[type] || Puzzle;
            const color = COLOR_MAP[type] || "from-gray-100 to-slate-100 text-slate-600";
            const isPending = m.id.startsWith("pending-");
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-soft p-5 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {m.defaultModule && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                        Default
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{m.moduleName}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{type.replace("_", " ")} module</p>

                  <div className="mt-4 pt-3 border-t border-[#F3F4F6] space-y-2">
                    {isPending ? (
                      <Button
                        size="sm"
                        onClick={() => ensureModuleExists(type, m.moduleName)}
                        disabled={creating}
                        className="w-full h-8 rounded-lg bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90 text-white text-xs"
                      >
                        Enable Module
                      </Button>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Enabled</span>
                          <Switch checked={!!m.status} onCheckedChange={() => toggleStatus(m)} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Set as default</span>
                          <Switch
                            checked={!!m.defaultModule}
                            onCheckedChange={() => toggleDefault(m)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
