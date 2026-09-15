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
import { Switch } from "@/components/ui/switch";

interface Employee {
  id: string;
  vendorId?: string | null;
  vendorName?: string | null;
  fName: string | null;
  lName: string | null;
  phone: string | null;
  email: string;
  role: string | null;
  isActive: boolean;
}

const FALLBACK: Employee[] = [
  { id: "1", vendorName: "Bella Italia", fName: "Marco", lName: "Rossi", phone: "+1 555-0101", email: "marco@bellaitalia.com", role: "manager", isActive: true },
  { id: "2", vendorName: "Sushi House", fName: "Yuki", lName: "Tanaka", phone: "+1 555-0102", email: "yuki@sushihouse.com", role: "employee", isActive: true },
  { id: "3", vendorName: "Burger Joint", fName: "Alex", lName: "Carter", phone: "+1 555-0103", email: "alex@burgerjoint.com", role: "cashier", isActive: false },
  { id: "4", vendorName: "Taco Loco", fName: "Maria", lName: "Garcia", phone: "+1 555-0104", email: "maria@tacoloco.com", role: "manager", isActive: true },
  { id: "5", vendorName: "Green Bowl", fName: "Sam", lName: "Lee", phone: "+1 555-0105", email: "sam@greenbowl.com", role: "employee", isActive: true },
];

const EMPTY: Employee = {
  id: "",
  vendorId: "",
  vendorName: "",
  fName: "",
  lName: "",
  phone: "",
  email: "",
  role: "employee",
  isActive: true,
};

export default function EmployeesPage() {
  const { items, loading, create, update, remove, refetch } = useCrud<Employee>({
    endpoint: "/api/employees",
    realtimeTable: "vendor_employees",
    mapRow: (r) => ({
      id: String(r.id),
      vendorId: r.vendorId ? String(r.vendorId) : null,
      vendorName: r.vendorName ?? null,
      fName: r.fName ?? null,
      lName: r.lName ?? null,
      phone: r.phone ?? null,
      email: r.email ?? "",
      role: r.role ?? "employee",
      isActive: !!r.isActive,
    }),
    itemName: "Employee",
    fallback: FALLBACK,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Employee>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({ ...e });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.email.trim()) return;
    const payload: Partial<Employee> = {
      vendorId: form.vendorId || undefined,
      fName: form.fName,
      lName: form.lName,
      phone: form.phone,
      email: form.email,
      role: form.role,
      isActive: form.isActive,
    };
    const ok = editing
      ? await update(editing.id, payload)
      : await create(payload);
    if (ok) setOpen(false);
  };

  const toggleActive = (e: Employee) =>
    update(e.id, { isActive: !e.isActive });

  const columns: Column<Employee>[] = [
    { key: "id", header: "ID" },
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <span className="font-semibold text-foreground">
          {[r.fName, r.lName].filter(Boolean).join(" ") || "—"}
        </span>
      ),
    },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    {
      key: "role",
      header: "Role",
      render: (r) => (
        <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-primary text-xs font-medium capitalize">
          {r.role || "employee"}
        </span>
      ),
    },
    {
      key: "vendorName",
      header: "Vendor",
      render: (r) => <span className="text-muted-foreground">{r.vendorName || "—"}</span>,
    },
    {
      key: "isActive",
      header: "Active",
      align: "center",
      render: (r) => (
        <Switch checked={!!r.isActive} onCheckedChange={() => toggleActive(r)} />
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
      <CrudListTable<Employee>
        title="Employees"
        description="Manage admin panel employees — create accounts, assign roles, and track activity."
        items={items}
        loading={loading}
        columns={columns}
        searchKeys={["email", "fName", "lName", "phone", "vendorName"]}
        statusKey="isActive"
        filters={[
          { label: "All", value: "all", match: () => true },
          { label: "Active", value: "active", match: (r) => !!r.isActive },
          { label: "Inactive", value: "inactive", match: (r) => !r.isActive },
          { label: "Managers", value: "managers", match: (r) => r.role === "manager" },
        ]}
        actionLabel="Add Employee"
        onAction={openCreate}
        onRefresh={refetch}
        emptyMessage="No employees yet. Create the first employee account."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="e-fname">First name</Label>
              <Input
                id="e-fname"
                value={form.fName ?? ""}
                onChange={(e) => setForm({ ...form, fName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-lname">Last name</Label>
              <Input
                id="e-lname"
                value={form.lName ?? ""}
                onChange={(e) => setForm({ ...form, lName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="e-email">Email *</Label>
              <Input
                id="e-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="employee@vendor.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-phone">Phone</Label>
              <Input
                id="e-phone"
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-role">Role</Label>
              <Input
                id="e-role"
                value={form.role ?? ""}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="manager / employee / cashier"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="e-vendor">Vendor ID</Label>
              <Input
                id="e-vendor"
                value={form.vendorId ?? ""}
                onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                placeholder="vendor UUID"
              />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Enable this employee account</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(c) => setForm({ ...form, isActive: c })}
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
              {editing ? "Save Changes" : "Create Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
