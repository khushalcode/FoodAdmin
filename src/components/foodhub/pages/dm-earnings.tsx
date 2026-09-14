"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Earning {
  id: string;
  driver: string;
  deliveries: number;
  base: number;
  tips: number;
  bonus: number;
  total: number;
  period: string;
  status: string;
}

const DATA: Earning[] = [
  { id: "EARN-001", driver: "Carlos Rivera", deliveries: 248, base: 2400, tips: 980, bonus: 460, total: 3840, period: "Nov 2025", status: "Paid" },
  { id: "EARN-002", driver: "Aisha Khan", deliveries: 312, base: 3120, tips: 720, bonus: 280, total: 4120, period: "Nov 2025", status: "Paid" },
  { id: "EARN-003", driver: "David Park", deliveries: 188, base: 1880, tips: 620, bonus: 340, total: 2840, period: "Nov 2025", status: "Paid" },
  { id: "EARN-004", driver: "Maria Santos", deliveries: 412, base: 4120, tips: 880, bonus: 280, total: 5280, period: "Nov 2025", status: "Paid" },
  { id: "EARN-005", driver: "James Wilson", deliveries: 96, base: 960, tips: 280, bonus: 180, total: 1420, period: "Nov 2025", status: "Pending" },
  { id: "EARN-006", driver: "Fatima Ali", deliveries: 224, base: 2240, tips: 720, bonus: 280, total: 3240, period: "Nov 2025", status: "Paid" },
  { id: "EARN-007", driver: "Robert Chen", deliveries: 312, base: 3120, tips: 980, bonus: 380, total: 4480, period: "Nov 2025", status: "Paid" },
  { id: "EARN-008", driver: "Sara Mohamed", deliveries: 158, base: 1580, tips: 480, bonus: 280, total: 2340, period: "Nov 2025", status: "Pending" },
];

const COLORS = ["from-orange-500 to-red-600", "from-violet-500 to-purple-600", "from-blue-500 to-cyan-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-pink-500 to-rose-600", "from-cyan-500 to-blue-600", "from-indigo-500 to-violet-600"];

export default function DmEarningsPage() {
  return (
    <ListTable<Earning>
      title="DM Earnings"
      description="Monthly earnings of delivery personnel"
      data={DATA}
      searchKeys={["driver"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Paid", value: "paid", match: (r) => r.status === "Paid" },
        { label: "Pending", value: "pending", match: (r) => r.status === "Pending" },
      ]}
      actionLabel="Export Payroll"
      onAction={() => toast.success("Exporting payroll...")}
      columns={[
        {
          key: "driver",
          header: "Driver",
          render: (r, i) => (
            <div className="flex items-center gap-2.5">
              <Avatar className="w-9 h-9 rounded-full">
                <AvatarFallback className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full font-semibold`}>
                  {r.driver.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-[#111827]">{r.driver}</p>
                <p className="text-xs text-[#9CA3AF]">{r.id} · {r.period}</p>
              </div>
            </div>
          ),
        },
        { key: "deliveries", header: "Deliveries", align: "right", render: (r) => <span className="font-medium text-[#111827]">{r.deliveries}</span> },
        { key: "base", header: "Base", align: "right", render: (r) => <span className="text-[#4B5563]">${r.base}</span> },
        { key: "tips", header: "Tips", align: "right", render: (r) => <span className="text-amber-600">${r.tips}</span> },
        { key: "bonus", header: "Bonus", align: "right", render: (r) => <span className="text-violet-600">${r.bonus}</span> },
        { key: "total", header: "Total", align: "right", render: (r) => <span className="font-bold text-emerald-600">${r.total.toLocaleString()}</span> },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.id}`)}
              onEdit={() => toast.info(`Adjusting ${r.id}`)}
              onDelete={() => toast.error(`Voiding ${r.id}`)}
            />
          ),
        },
      ]}
    />
  );
}
