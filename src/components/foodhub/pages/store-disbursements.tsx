"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Disbursement {
  id: string;
  restaurant: string;
  amount: number;
  fee: number;
  net: number;
  method: string;
  reference: string;
  date: string;
  status: string;
}

const DATA: Disbursement[] = [
  { id: "DIS-101", restaurant: "Bella Italia", amount: 2150, fee: 21.5, net: 2128.5, method: "Bank Transfer", reference: "TXN-9382-2110", date: "2025-11-15", status: "Completed" },
  { id: "DIS-102", restaurant: "Sushi Express", amount: 1840, fee: 18.4, net: 1821.6, method: "PayPal", reference: "TXN-9383-2111", date: "2025-11-14", status: "Completed" },
  { id: "DIS-103", restaurant: "Tandoori House", amount: 980, fee: 9.8, net: 970.2, method: "Stripe", reference: "TXN-9384-2112", date: "2025-11-13", status: "Completed" },
  { id: "DIS-104", restaurant: "Burger Bros", amount: 670, fee: 6.7, net: 663.3, method: "Bank Transfer", reference: "TXN-9385-2113", date: "2025-11-12", status: "Processing" },
  { id: "DIS-105", restaurant: "Pho Paradise", amount: 425, fee: 4.25, net: 420.75, method: "Bank Transfer", reference: "TXN-9386-2114", date: "2025-11-11", status: "Completed" },
  { id: "DIS-106", restaurant: "Green Bowl", amount: 880, fee: 8.8, net: 871.2, method: "Stripe", reference: "TXN-9387-2115", date: "2025-11-10", status: "Completed" },
  { id: "DIS-107", restaurant: "Pizza Roma", amount: 1245, fee: 12.45, net: 1232.55, method: "Bank Transfer", reference: "TXN-9388-2116", date: "2025-11-09", status: "Failed" },
  { id: "DIS-108", restaurant: "Dragon Wok", amount: 540, fee: 5.4, net: 534.6, method: "PayPal", reference: "TXN-9389-2117", date: "2025-11-08", status: "Completed" },
];

export default function StoreDisbursementsPage() {
  return (
    <ListTable<Disbursement>
      title="Store Disbursements"
      description="Completed payouts sent to restaurant partners"
      data={DATA}
      searchKeys={["id", "restaurant", "reference"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Completed", value: "completed", match: (r) => r.status === "Completed" },
        { label: "Processing", value: "processing", match: (r) => r.status === "Processing" },
        { label: "Failed", value: "failed", match: (r) => r.status === "Failed" },
      ]}
      actionLabel="Export"
      onAction={() => toast.success("Exporting disbursements...")}
      columns={[
        { key: "id", header: "ID", render: (r) => <span className="font-semibold text-primary">{r.id}</span> },
        { key: "restaurant", header: "Restaurant", render: (r) => <span className="font-medium text-[#111827]">{r.restaurant}</span> },
        { key: "amount", header: "Gross", align: "right", render: (r) => <span className="text-[#4B5563]">${r.amount.toFixed(2)}</span> },
        { key: "fee", header: "Fee", align: "right", render: (r) => <span className="text-red-500">-${r.fee.toFixed(2)}</span> },
        { key: "net", header: "Net", align: "right", render: (r) => <span className="font-semibold text-emerald-600">${r.net.toFixed(2)}</span> },
        { key: "method", header: "Method" },
        { key: "reference", header: "Reference", render: (r) => <span className="font-mono text-xs text-[#6B7280]">{r.reference}</span> },
        { key: "date", header: "Date" },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.id}`)}
              onEdit={() => toast.info(`Re-issuing ${r.id}`)}
              onDelete={() => toast.error(`Voiding ${r.id}`)}
            />
          ),
        },
      ]}
    />
  );
}
