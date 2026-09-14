"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Txn {
  id: string;
  type: string;
  ref: string;
  customer: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}

const DATA: Txn[] = [
  { id: "TXN-9821", type: "Order Payment", ref: "#ORD-2841", customer: "Olivia Martin", amount: 42.5, method: "Card", status: "Completed", date: "2025-11-15 14:23" },
  { id: "TXN-9820", type: "Wallet Top-up", ref: "W-03", customer: "Sophia Patel", amount: 200, method: "Bank", status: "Completed", date: "2025-11-15 13:55" },
  { id: "TXN-9819", type: "Order Payment", ref: "#ORD-2840", customer: "Liam Chen", amount: 28.99, method: "Wallet", status: "Completed", date: "2025-11-15 13:42" },
  { id: "TXN-9818", type: "Refund", ref: "#ORD-2836", customer: "Mason Brown", amount: -54.0, method: "Card", status: "Completed", date: "2025-11-15 12:18" },
  { id: "TXN-9817", type: "Order Payment", ref: "#ORD-2839", customer: "Sophia Patel", amount: 67.45, method: "Card", status: "Completed", date: "2025-11-15 12:05" },
  { id: "TXN-9816", type: "Subscription", ref: "PRO-RENEW", customer: "Emma Garcia", amount: 49.99, method: "Card", status: "Completed", date: "2025-11-15 11:30" },
  { id: "TXN-9815", type: "Payout", ref: "PR-003", customer: "Tandoori House", amount: -2150, method: "Bank", status: "Completed", date: "2025-11-15 10:48" },
  { id: "TXN-9814", type: "Order Payment", ref: "#ORD-2838", customer: "Noah Williams", amount: 11.49, method: "Cash", status: "Completed", date: "2025-11-15 10:24" },
  { id: "TXN-9813", type: "Wallet Top-up", ref: "W-01", customer: "Olivia Martin", amount: 100, method: "PayPal", status: "Completed", date: "2025-11-15 09:15" },
  { id: "TXN-9812", type: "Order Payment", ref: "#ORD-2837", customer: "Emma Garcia", amount: 38.2, method: "Card", status: "Failed", date: "2025-11-15 08:42" },
];

export default function TransactionsPage() {
  return (
    <ListTable<Txn>
      title="Transactions"
      description="All financial transactions across FoodHub"
      data={DATA}
      searchKeys={["id", "customer", "ref"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Completed", value: "completed", match: (r) => r.status === "Completed" },
        { label: "Failed", value: "failed", match: (r) => r.status === "Failed" },
      ]}
      actionLabel="Export"
      onAction={() => toast.success("Exporting transactions...")}
      columns={[
        { key: "id", header: "Txn ID", render: (r) => <span className="font-mono font-semibold text-primary text-xs">{r.id}</span> },
        { key: "type", header: "Type", render: (r) => <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${r.amount < 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{r.type}</span> },
        { key: "ref", header: "Reference", render: (r) => <span className="font-medium text-[#111827]">{r.ref}</span> },
        { key: "customer", header: "Customer / Restaurant" },
        { key: "method", header: "Method", render: (r) => <span className="text-[#4B5563]">{r.method}</span> },
        { key: "amount", header: "Amount", align: "right", render: (r) => <span className={`font-bold ${r.amount < 0 ? "text-red-600" : "text-emerald-600"}`}>{r.amount < 0 ? "-" : "+"}${Math.abs(r.amount).toFixed(2)}</span> },
        { key: "date", header: "Date" },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.id}`)}
              onEdit={() => toast.info(`Refunding ${r.id}`)}
            />
          ),
        },
      ]}
    />
  );
}
