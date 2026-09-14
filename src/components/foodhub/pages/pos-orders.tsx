"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface PosOrder {
  id: string;
  invoice: string;
  customer: string;
  cashier: string;
  total: number;
  method: string;
  status: string;
  time: string;
}

const DATA: PosOrder[] = [
  { id: "POS-2401", invoice: "INV-2401", customer: "Walk-in", cashier: "Sara Lee", total: 42.5, method: "Card", status: "Completed", time: "10:24 AM" },
  { id: "POS-2402", invoice: "INV-2402", customer: "Walk-in", cashier: "Mike Ross", total: 18.75, method: "Cash", status: "Completed", time: "10:48 AM" },
  { id: "POS-2403", invoice: "INV-2403", customer: "Walk-in", cashier: "Sara Lee", total: 67.2, method: "Wallet", status: "Completed", time: "11:15 AM" },
  { id: "POS-2404", invoice: "INV-2404", customer: "Walk-in", cashier: "Anna Wu", total: 12.99, method: "Card", status: "Completed", time: "11:34 AM" },
  { id: "POS-2405", invoice: "INV-2405", customer: "Walk-in", cashier: "Mike Ross", total: 31.4, method: "Card", status: "Refunded", time: "12:02 PM" },
  { id: "POS-2406", invoice: "INV-2406", customer: "Walk-in", cashier: "Anna Wu", total: 24.0, method: "Cash", status: "Completed", time: "12:18 PM" },
  { id: "POS-2407", invoice: "INV-2407", customer: "Walk-in", cashier: "Sara Lee", total: 55.5, method: "Wallet", status: "Completed", time: "12:45 PM" },
  { id: "POS-2408", invoice: "INV-2408", customer: "Walk-in", cashier: "Mike Ross", total: 9.49, method: "Cash", status: "Cancelled", time: "01:10 PM" },
  { id: "POS-2409", invoice: "INV-2409", customer: "Walk-in", cashier: "Anna Wu", total: 78.25, method: "Card", status: "Completed", time: "01:32 PM" },
  { id: "POS-2410", invoice: "INV-2410", customer: "Walk-in", cashier: "Sara Lee", total: 19.99, method: "Card", status: "Completed", time: "01:55 PM" },
];

export default function PosOrdersPage() {
  return (
    <ListTable<PosOrder>
      title="POS Orders"
      description="Orders placed via the in-store Point of Sale"
      data={DATA}
      searchKeys={["id", "invoice", "cashier"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Completed", value: "completed", match: (r) => r.status === "Completed" },
        { label: "Refunded", value: "refunded", match: (r) => r.status === "Refunded" },
        { label: "Cancelled", value: "cancelled", match: (r) => r.status === "Cancelled" },
      ]}
      actionLabel="New POS Sale"
      onAction={() => toast.success("Opening POS terminal...")}
      columns={[
        { key: "id", header: "Order", render: (r) => <span className="font-semibold text-primary">{r.id}</span> },
        { key: "invoice", header: "Invoice" },
        { key: "cashier", header: "Cashier" },
        { key: "method", header: "Payment", render: (r) => <span className="inline-block px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-medium">{r.method}</span> },
        { key: "total", header: "Total", align: "right", render: (r) => <span className="font-semibold text-[#111827]">${r.total.toFixed(2)}</span> },
        { key: "status", header: "Status" },
        { key: "time", header: "Time", align: "right", render: (r) => <span className="text-xs text-[#9CA3AF]">{r.time}</span> },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.id}`)}
              onEdit={() => toast.info(`Refunding ${r.id}`)}
              onDelete={() => toast.error(`Cancelling ${r.id}`)}
            />
          ),
        },
      ]}
    />
  );
}
