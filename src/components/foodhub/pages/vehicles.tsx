"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Vehicle {
  id: string;
  name: string;
  description: string;
  isDelivery: boolean;
  isRide: boolean;
  coverageArea: number;
  extraCharges: number;
  status: string;
}

const FALLBACK: Vehicle[] = [
  { id: "V-01", name: "Motorcycle", description: "Honda CB125 — fast & agile", isDelivery: true, isRide: false, coverageArea: 10, extraCharges: 1.5, status: "Active" },
  { id: "V-02", name: "Scooter", description: "Vespa 150 — efficient", isDelivery: true, isRide: false, coverageArea: 8, extraCharges: 1.0, status: "Active" },
  { id: "V-03", name: "Bicycle", description: "Trek FX2 E-Bike — eco", isDelivery: true, isRide: false, coverageArea: 4, extraCharges: 0.5, status: "Active" },
  { id: "V-04", name: "Car", description: "Toyota Prius — long distance", isDelivery: true, isRide: true, coverageArea: 25, extraCharges: 5.0, status: "Active" },
  { id: "V-05", name: "Van", description: "Mercedes Sprinter — bulk", isDelivery: true, isRide: false, coverageArea: 30, extraCharges: 8.0, status: "Inactive" },
];

const emptyForm = {
  name: "",
  description: "",
  isDelivery: "true",
  isRide: "false",
  coverageArea: "",
  extraCharges: "",
  status: "Active",
};

export default function VehiclesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Vehicle>({
    endpoint: "/api/vehicles",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name ?? "",
      description: r.description ?? "",
      isDelivery: Boolean(r.isDelivery ?? r.is_delivery ?? true),
      isRide: Boolean(r.isRide ?? r.is_ride ?? false),
      coverageArea: Number(r.coverageArea ?? r.coverage_area ?? 0),
      extraCharges: Number(r.extraCharges ?? r.extra_charges ?? 0),
      status: r.status ?? "Active",
    }),
    itemName: "Vehicle",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      name: v.name,
      description: v.description,
      isDelivery: String(v.isDelivery),
      isRide: String(v.isRide),
      coverageArea: String(v.coverageArea),
      extraCharges: String(v.extraCharges),
      status: v.status,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name) return;
    setSubmitting(true);
    const payload = {
      name: form.name,
      description: form.description,
      isDelivery: form.isDelivery === "true",
      isRide: form.isRide === "true",
      coverageArea: Number(form.coverageArea || 0),
      extraCharges: Number(form.extraCharges || 0),
      status: form.status,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    setSubmitting(false);
    if (ok) {
      setOpen(false);
      setForm(emptyForm);
      setEditing(null);
    }
  };

  const columns: Column<Vehicle>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-semibold text-[#111827]">{r.name}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (r) => <span className="text-[#4B5563] text-sm">{r.description || "—"}</span>,
    },
    {
      key: "isDelivery",
      header: "Delivery",
      align: "center",
      render: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
            r.isDelivery ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {r.isDelivery ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "isRide",
      header: "Ride",
      align: "center",
      render: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
            r.isRide ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {r.isRide ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "coverageArea",
      header: "Coverage (km)",
      align: "right",
      render: (r) => <span className="text-[#4B5563]">{r.coverageArea}</span>,
    },
    {
      key: "extraCharges",
      header: "Extra Charges",
      align: "right",
      render: (r) => <span className="font-semibold text-amber-600">+${r.extraCharges.toFixed(2)}</span>,
    },
    { key: "status", header: "Status" },
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
      <CrudListTable<Vehicle>
        title="Vehicles"
        description="Delivery fleet management"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["name", "description"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => r.status === "Active" },
          { label: "Inactive", value: "inactive", match: (r) => r.status === "Inactive" },
        ]}
        onRefresh={refetch}
        actionLabel="Add Vehicle"
        onAction={openCreate}
        emptyMessage="No vehicles found."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Vehicle" : "Create Vehicle"}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {editing ? "Update the vehicle configuration." : "Configure a new vehicle type for deliveries/rides."}
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-name">Name *</Label>
              <Input
                id="v-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Motorcycle"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-desc">Description</Label>
              <Textarea
                id="v-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Honda CB125 — fast & agile"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Delivery</Label>
                <Select value={form.isDelivery} onValueChange={(v) => setForm({ ...form, isDelivery: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Ride</Label>
                <Select value={form.isRide} onValueChange={(v) => setForm({ ...form, isRide: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="v-coverage">Coverage Area (km)</Label>
                <Input
                  id="v-coverage"
                  type="number"
                  value={form.coverageArea}
                  onChange={(e) => setForm({ ...form, coverageArea: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-extra">Extra Charges ($)</Label>
                <Input
                  id="v-extra"
                  type="number"
                  value={form.extraCharges}
                  onChange={(e) => setForm({ ...form, extraCharges: e.target.value })}
                  placeholder="1.50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !form.name}>
              {submitting ? "Saving..." : editing ? "Update Vehicle" : "Create Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
