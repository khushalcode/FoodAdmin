"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CrudListTable, type Column } from "../shared/crud-list-table";
import { TableActionButtons } from "../shared/list-page";
import { useCrud } from "@/hooks/use-crud";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DM {
  id: string;
  name: string;
  phone: string;
  zone: string;
  active: boolean;
  type: string;
  earnings: number;
  currentOrders: number;
  status: string;
}

const FALLBACK: DM[] = [
  { id: "DM-01", name: "Carlos Rivera", phone: "+1 555 0142", zone: "Downtown", active: true, type: "freelancer", earnings: 3840, currentOrders: 2, status: "Online" },
  { id: "DM-02", name: "Aisha Khan", phone: "+1 555 0198", zone: "Uptown", active: true, type: "freelancer", earnings: 4120, currentOrders: 1, status: "On Delivery" },
  { id: "DM-03", name: "David Park", phone: "+1 555 0245", zone: "Westside", active: true, type: "salary", earnings: 2840, currentOrders: 0, status: "Online" },
  { id: "DM-04", name: "Maria Santos", phone: "+1 555 0312", zone: "Eastside", active: true, type: "freelancer", earnings: 5280, currentOrders: 3, status: "Busy" },
  { id: "DM-05", name: "James Wilson", phone: "+1 555 0356", zone: "Midtown", active: false, type: "salary", earnings: 1420, currentOrders: 0, status: "Offline" },
];

const AVATAR_COLORS = [
  "from-orange-500 to-red-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
];

const emptyForm = {
  fName: "",
  lName: "",
  email: "",
  phone: "",
  password: "",
  zoneId: "",
  type: "freelancer",
};

export default function DeliveryBoysPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<DM>({
    endpoint: "/api/delivery-men",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name ?? `${r.fName ?? ""} ${r.lName ?? ""}`.trim(),
      phone: r.phone ?? "",
      zone: r.zone ?? r.zoneName ?? r.zone_name ?? "",
      active: r.active ?? true,
      type: r.type ?? "freelancer",
      earnings: Number(r.earnings ?? 0),
      currentOrders: Number(r.currentOrders ?? 0),
      status: r.status ?? (r.active ? "Online" : "Offline"),
    }),
    itemName: "Delivery man",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!form.fName || !form.lName || !form.email || !form.phone || !form.password) {
      toast.error("Fill all required fields");
      return;
    }
    setSubmitting(true);
    const ok = await create(form);
    setSubmitting(false);
    if (ok) {
      setOpen(false);
      setForm(emptyForm);
    }
  };

  const handleToggleActive = async (dm: DM) => {
    await update(dm.id, { active: !dm.active });
  };

  const columns: Column<DM>[] = [
    {
      key: "name",
      header: "Delivery Boy",
      render: (r, i) => (
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Avatar className="w-9 h-9 rounded-full">
              <AvatarFallback
                className={`bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white text-xs rounded-full font-semibold`}
              >
                {r.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                r.active
                  ? r.currentOrders > 0
                    ? "bg-blue-500"
                    : "bg-emerald-500"
                  : "bg-gray-300"
              }`}
            />
          </div>
          <div>
            <p className="font-medium text-[#111827]">{r.name}</p>
            <p className="text-xs text-[#9CA3AF]">{r.phone}</p>
          </div>
        </div>
      ),
    },
    { key: "zone", header: "Zone" },
    {
      key: "active",
      header: "Active",
      align: "center",
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
            r.active
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {r.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (r) => (
        <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-xs font-medium capitalize">
          {r.type}
        </span>
      ),
    },
    {
      key: "earnings",
      header: "Earnings",
      align: "right",
      render: (r) => <span className="font-semibold text-emerald-600">${r.earnings.toLocaleString()}</span>,
    },
    {
      key: "currentOrders",
      header: "Current Orders",
      align: "right",
      render: (r) => (
        <span className={`font-semibold ${r.currentOrders > 0 ? "text-primary" : "text-[#9CA3AF]"}`}>
          {r.currentOrders}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex items-center gap-1">
          <TableActionButtons
            onView={() => toast.info(`Viewing ${r.name}`)}
            onDelete={() => remove(r.id)}
          />
          <button
            onClick={() => handleToggleActive(r)}
            className="ml-1 h-7 px-2 rounded-md text-[11px] font-medium border transition-colors hover:bg-[#F9FAFB]"
            title={r.active ? "Deactivate" : "Activate"}
          >
            {r.active ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CrudListTable<DM>
        title="Delivery Boys"
        description="Delivery personnel currently on FoodHub"
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["name", "phone", "zone"]}
        statusKey="status"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => r.active },
          { label: "Inactive", value: "inactive", match: (r) => !r.active },
        ]}
        onRefresh={refetch}
        actionLabel="Add Delivery Boy"
        onAction={() => setOpen(true)}
        emptyMessage="No delivery personnel found."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Delivery Boy</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Create a new delivery personnel account.
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dm-fname">First Name *</Label>
                <Input
                  id="dm-fname"
                  value={form.fName}
                  onChange={(e) => setForm({ ...form, fName: e.target.value })}
                  placeholder="Carlos"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-lname">Last Name *</Label>
                <Input
                  id="dm-lname"
                  value={form.lName}
                  onChange={(e) => setForm({ ...form, lName: e.target.value })}
                  placeholder="Rivera"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dm-email">Email *</Label>
                <Input
                  id="dm-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="carlos@foodhub.app"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-phone">Phone *</Label>
                <Input
                  id="dm-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555 0142"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dm-password">Password *</Label>
                <Input
                  id="dm-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-zone">Zone ID</Label>
                <Input
                  id="dm-zone"
                  value={form.zoneId}
                  onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
                  placeholder="zone-downtown"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "Creating..." : "Create Delivery Boy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
