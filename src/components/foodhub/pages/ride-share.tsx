"use client";

import { toast } from "sonner";
import { motion } from "framer-motion";
import { Car, RefreshCw } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface Vehicle {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isDelivery: boolean;
  isRide: boolean;
  startingCoverageArea: number;
  maximumCoverageArea: number;
  extraCharges: number;
  status: boolean;
}

const FALLBACK_VEHICLES: Vehicle[] = [
  { id: "1", name: "Sedan", description: "Comfortable 4-seat sedan", image: null, isDelivery: false, isRide: true, startingCoverageArea: 2, maximumCoverageArea: 30, extraCharges: 0, status: true },
  { id: "2", name: "SUV", description: "Spacious SUV for groups", image: null, isDelivery: false, isRide: true, startingCoverageArea: 2, maximumCoverageArea: 40, extraCharges: 2.5, status: true },
  { id: "3", name: "Motorbike", description: "Quick rides through traffic", image: null, isDelivery: true, isRide: true, startingCoverageArea: 1, maximumCoverageArea: 15, extraCharges: 0, status: true },
  { id: "4", name: "Luxury Sedan", description: "Premium black car service", image: null, isDelivery: false, isRide: true, startingCoverageArea: 3, maximumCoverageArea: 25, extraCharges: 10, status: false },
];

export default function RideSharePage() {
  const { items: modules, loading: modulesLoading, update: updateModule, refetch: refetchModules } = useCrud<Module>({
    endpoint: "/api/modules",
    realtimeTable: "modules",
    mapRow: (r) => ({
      id: String(r.id),
      moduleName: r.moduleName ?? "",
      moduleType: r.moduleType ?? "",
      status: r.status ?? false,
      defaultModule: !!r.defaultModule,
    }),
    itemName: "Module",
    fallback: [],
  });

  const { items: vehicles, loading: vehiclesLoading, update: updateVehicle, remove: removeVehicle, refetch: refetchVehicles } = useCrud<Vehicle>({
    endpoint: "/api/vehicles",
    realtimeTable: "d_m_vehicles",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name ?? "",
      description: r.description ?? null,
      image: r.image ?? null,
      isDelivery: !!r.isDelivery,
      isRide: !!r.isRide,
      startingCoverageArea: Number(r.startingCoverageArea || 0),
      maximumCoverageArea: Number(r.maximumCoverageArea || 0),
      extraCharges: Number(r.extraCharges || 0),
      status: r.status ?? true,
    }),
    itemName: "Vehicle",
    fallback: FALLBACK_VEHICLES,
  });

  // Find the ride-share module from the modules list.
  const rideModule = (modules || []).find(
    (m) => ["ride share", "ride_share", "rideshare"].includes((m.moduleType || "").toLowerCase()),
  );

  const rideVehicles = (vehicles || []).filter((v) => v.isRide);

  const toggleModule = () => {
    if (!rideModule) {
      toast.error("Ride Share module isn't initialized. Enable it from Modules page first.");
      return;
    }
    updateModule(rideModule.id, { status: !rideModule.status });
  };

  const toggleVehicleStatus = (v: Vehicle) =>
    updateVehicle(v.id, { status: !v.status });

  const refreshAll = () => {
    refetchModules();
    refetchVehicles();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ride Share</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure the ride-share module and manage available vehicle types.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          className="h-9 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center text-indigo-700">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Ride Share Module</CardTitle>
                <CardDescription>Toggle to enable or disable ride-share bookings in the customer app.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {modulesLoading ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : (
              <div className="flex items-center justify-between bg-white rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {rideModule ? rideModule.moduleName : "Ride Share"} module is{" "}
                    <span className={rideModule?.status ? "text-emerald-700" : "text-muted-foreground"}>
                      {rideModule?.status ? "ENABLED" : "DISABLED"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rideModule
                      ? "Customers can request rides when enabled."
                      : "Module not yet initialized — enable it from the Modules page."}
                  </p>
                </div>
                <Switch
                  checked={!!rideModule?.status}
                  onCheckedChange={toggleModule}
                  disabled={!rideModule}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft overflow-hidden">
        <CardHeader>
          <CardTitle>Ride Vehicles</CardTitle>
          <CardDescription>Vehicles available for ride-share bookings.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {vehiclesLoading ? (
            <div className="p-5 space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : rideVehicles.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No ride-share vehicles configured. Add vehicles from the Vehicles page and mark them as ride-capable.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Vehicle</th>
                  <th className="text-left px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Coverage</th>
                  <th className="text-right px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Extra</th>
                  <th className="text-center px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Active</th>
                  <th className="text-right px-4 py-2 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rideVehicles.map((v, i) => (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="border-t border-border hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.description || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {v.startingCoverageArea} – {v.maximumCoverageArea} km
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      {v.extraCharges > 0 ? `+$${v.extraCharges}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={!!v.status} onCheckedChange={() => toggleVehicleStatus(v)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <TableActionButtons onDelete={() => removeVehicle(v.id)} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
