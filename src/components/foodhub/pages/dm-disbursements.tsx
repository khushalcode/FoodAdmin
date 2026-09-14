"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Disbursement {
  id: string;
  driver: string;
  amount: number;
  fee: number;
  net: number;
  method: string;
  period: string;
  date: string;
  status: string;
}

const DATA: Disbursement[] = [
  { id: "DMD-001", driver: "Carlos Rivera", amount: 3840, fee: 38.4, net: 3801.6, method: "Bank Transfer", period: "Nov 2025", date: "2025-12-01", status: "Completed" },
  { id: "DMD-002", driver: "Aisha Khan", amount: 4120, fee: 41.2, net: 4078.8, method: "PayPal", period: "Nov 2025", date: "2025-12-01", status: "Completed" },
  { id: "DMD-003", driver: "David Park", amount: 2840, fee: 28.4, net: 2811.6, method: "Bank Transfer", period: "Nov 2025", date: "2025-12-01", status: "Completed" },
  { id: "DMD-004", driver: "Maria Santos", amount: 5280, fee: 52.8, net: 5227.2, method: "Stripe", period: "Nov 2025", date: "2025-12-01", status: "Processing" },
  { id: "DMD-005", driver: "James Wilson", amount: 1420, fee: 14.2, net: 1405.8, method: "Bank Transfer", period: "Nov 2025", date: "2025-12-01", status: "Pending" },
  { id: "DMD-006", driver: "Fatima Ali", amount: 3240, fee: 32.4, net: 3207.6, method: "PayPal", period: "Nov 2025", date: "2025-12-01", status: "Completed" },
  { id: "DMD-007", driver: "Robert Chen", amount: 4480, fee: 44.8, net: 4435.2, method: "Bank Transfer", period: "Nov 2025", date: "2025-12-01", status: "Failed" },
  { id: "DMD-008", driver: "Sara Mohamed", amount: 2340, fee: 23.4, net: 2316.6, method: "Stripe", period: "Nov 2025", date: "2025-12-01", status: "Pending" },
];

const COLORS = ["from-orange-500 to-red-600", "from-violet-500 to-purple-600", "from-blue-500 to-cyan-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-pink-500 to-rose-600", "from-cyan-500 to-blue-600", "from-indigo-500 to-violet-600"];

export default function DmDisbursementsPage() {
  return (
    <ListTable<Disbursement>
      title="DM Disbursements"
      description="Payouts sent to delivery personnel"
      data={DATA}
      searchKeys={["driver", "method"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Completed", value: "completed", match: (r) => r.status === "Completed" },
        { label: "Processing", value: "processing", match: (r) => r.status === "Processing" },
        { label: "Pending", value: "pending", match: (r) => r.status === "Pending" },
        { label: "Failed", value: "failed", match: (r) => r.status === "Failed" },
      ]}
      actionLabel="Export"
      onAction={() => toast.success("Exporting disbursements...")}
      columns={[
        { key: "id", header: "ID", render: (r) => <span className="font-semibold text-primary">{r.id}</span> },
        {
          key: "driver",
          header: "Driver",
          render: (r, i) => (
            <div className="flex items-center gap-2.5">
              <Avatar className="w-8 h-8 rounded-full">
                <AvatarFallback className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full font-semibold`}>
                  {r.driver.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-[#111827]">{r.driver}</span>
            </div>
          ),
        },
        { key: "amount", header: "Gross", align: "right", render: (r) => <span className="text-[#4B5563]">${r.amount}</span> },
        { key: "fee", header: "Fee", align: "right", render: (r) => <span className="text-red-500">-${r.fee}</span> },
        { key: "net", header: "Net", align: "right", render: (r) => <span className="font-semibold text-emerald-600">${r.net}</span> },
        { key: "method", header: "Method" },
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
