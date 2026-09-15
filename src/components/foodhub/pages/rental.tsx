"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { KeyRound, RefreshCw } from "lucide-react";
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
  { id: "1", name: "Van", description: "Spacious cargo van for furniture & appliances", image: null, isDelivery: true, isRide: false, startingCoverageArea: 5, maximumCoverageArea: 50, extraCharges: 15, status: true },
  { id: "2", name: "Box Truck", description: "Heavy-duty box truck for large moves", image: null, isDelivery: true, isRide: false, startingCoverageArea: 5, maximumCoverageArea: 80, extraCharges: 30, status: true },
  { id: "3", name: "Pickup Truck", description: "Open-bed pickup for medium loads", image: null, isDelivery: true, isRide: false, startingCoverageArea: 3, maximumCoverageArea: 40, extraCharges: 10, status: true },
  { id: "4", name: "Moving Truck", description: "Full-size moving truck for relocations", image: null, isDelivery: true, isRide: false, startingCoverageArea: 10, maximumCoverageArea: 100, extraCharges: 50, status: false },
];

export default function RentalPage() {
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

  const rentalModule = (modules || []).find(
    (m) => (m.moduleType || "").toLowerCase() === "rental",
  );

  // Rental-suitable vehicles: those that are delivery-capable with large coverage area.
  const rentalVehicles = (vehicles || []).filter(
    (v) => v.isDelivery && v.maximumCoverageArea >= 30,
  );

  const toggleModule = () => {
    if (!rentalModule) {
      toast.error("Rental module isn't initialized. Enable it from Modules page first.");
      return;
    }
    updateModule(rentalModule.id, { status: !rentalModule.status });
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
          <h1 className="text-2xl font-bold text-foreground">Rental</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure the rental module and manage rental-suitable vehicles (vans, trucks, etc.).
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
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center text-rose-700">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Rental Module</CardTitle>
                <CardDescription>Toggle to enable or disable vehicle rentals in the customer app.</CardDescription>
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
                    {rentalModule ? rentalModule.moduleName : "Rental"} module is{" "}
                    <span className={rentalModule?.status ? "text-emerald-700" : "text-muted-foreground"}>
                      {rentalModule?.status ? "ENABLED" : "DISABLED"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rentalModule
                      ? "Customers can book rental vehicles when enabled."
                      : "Module not yet initialized — enable it from the Modules page."}
                  </p>
                </div>
                <Switch
                  checked={!!rentalModule?.status}
                  onCheckedChange={toggleModule}
                  disabled={!rentalModule}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft overflow-hidden">
        <CardHeader>
          <CardTitle>Rental Vehicles</CardTitle>
          <CardDescription>Vehicles suitable for rental (delivery-capable, large coverage area).</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {vehiclesLoading ? (
            <div className="p-5 space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : rentalVehicles.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No rental-suitable vehicles found. Add delivery vehicles with coverage area ≥ 30 km.
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
                {rentalVehicles.map((v, i) => (
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
