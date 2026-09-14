"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Vehicle {
  id: string;
  plate: string;
  type: string;
  brand: string;
  driver: string;
  capacity: string;
  status: string;
}

const DATA: Vehicle[] = [
  { id: "V-01", plate: "NY-7842-A", type: "Motorcycle", brand: "Honda CB125", driver: "Carlos Rivera", capacity: "20 kg", status: "Available" },
  { id: "V-02", plate: "NY-9214-B", type: "Scooter", brand: "Vespa 150", driver: "Aisha Khan", capacity: "25 kg", status: "Busy" },
  { id: "V-03", plate: "NY-3382-C", type: "Bicycle", brand: "Trek FX2 E-Bike", driver: "David Park", capacity: "10 kg", status: "Available" },
  { id: "V-04", plate: "NY-5149-D", type: "Motorcycle", brand: "Yamaha NMAX", driver: "Maria Santos", capacity: "20 kg", status: "Busy" },
  { id: "V-05", plate: "NJ-2081-E", type: "Car", brand: "Toyota Prius", driver: "James Wilson", capacity: "120 kg", status: "Available" },
  { id: "V-06", plate: "NY-7720-F", type: "Scooter", brand: "Honda PCX", driver: "Fatima Ali", capacity: "25 kg", status: "Available" },
  { id: "V-07", plate: "NY-1188-G", type: "Motorcycle", brand: "Suzuki GSX", driver: "Robert Chen", capacity: "20 kg", status: "Maintenance" },
  { id: "V-08", plate: "NY-4456-H", type: "Bicycle", brand: "Gazelle Pure", driver: "Sara Mohamed", capacity: "10 kg", status: "Available" },
];

export default function VehiclesPage() {
  return (
    <ListTable<Vehicle>
      title="Vehicles"
      description="Delivery fleet management"
      data={DATA}
      searchKeys={["plate", "brand", "driver"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Available", value: "available", match: (r) => r.status === "Available" },
        { label: "Busy", value: "busy", match: (r) => r.status === "Busy" },
        { label: "Maintenance", value: "maintenance", match: (r) => r.status === "Maintenance" },
      ]}
      actionLabel="Add Vehicle"
      onAction={() => toast.success("Opening vehicle form...")}
      columns={[
        { key: "plate", header: "Plate", render: (r) => <span className="font-mono font-semibold text-[#111827] bg-[#F3F4F6] px-2 py-0.5 rounded">{r.plate}</span> },
        { key: "brand", header: "Vehicle", render: (r) => <span className="font-medium text-[#111827]">{r.brand}</span> },
        { key: "type", header: "Type", render: (r) => <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-primary text-xs font-medium">{r.type}</span> },
        { key: "driver", header: "Assigned Driver" },
        { key: "capacity", header: "Capacity", align: "right" },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.plate}`)}
              onEdit={() => toast.info(`Editing ${r.plate}`)}
              onDelete={() => toast.error(`Removing ${r.plate}`)}
            />
          ),
        },
      ]}
    />
  );
}
