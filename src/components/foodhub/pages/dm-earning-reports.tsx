"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Row {
  id: string;
  driver: string;
  deliveries: number;
  distance: number;
  hoursOnline: number;
  earnings: number;
  period: string;
}

const DATA: Row[] = [
  { id: "DMR-001", driver: "Maria Santos", deliveries: 412, distance: 1284, hoursOnline: 142, earnings: 5280, period: "Nov 2025" },
  { id: "DMR-002", driver: "Robert Chen", deliveries: 312, distance: 980, hoursOnline: 108, earnings: 4480, period: "Nov 2025" },
  { id: "DMR-003", driver: "Aisha Khan", deliveries: 312, distance: 920, hoursOnline: 116, earnings: 4120, period: "Nov 2025" },
  { id: "DMR-004", driver: "Carlos Rivera", deliveries: 248, distance: 740, hoursOnline: 92, earnings: 3840, period: "Nov 2025" },
  { id: "DMR-005", driver: "Fatima Ali", deliveries: 224, distance: 680, hoursOnline: 84, earnings: 3240, period: "Nov 2025" },
  { id: "DMR-006", driver: "David Park", deliveries: 188, distance: 540, hoursOnline: 72, earnings: 2840, period: "Nov 2025" },
  { id: "DMR-007", driver: "Sara Mohamed", deliveries: 158, distance: 480, hoursOnline: 64, earnings: 2340, period: "Nov 2025" },
  { id: "DMR-008", driver: "James Wilson", deliveries: 96, distance: 280, hoursOnline: 38, earnings: 1420, period: "Nov 2025" },
];

const COLORS = ["from-emerald-500 to-teal-600", "from-cyan-500 to-blue-600", "from-violet-500 to-purple-600", "from-orange-500 to-red-600", "from-pink-500 to-rose-600", "from-blue-500 to-indigo-600", "from-amber-500 to-orange-600", "from-rose-500 to-pink-600"];

export default function DmEarningReportsPage() {
  return (
    <ListTable<Row>
      title="DM Earning Reports"
      description="Per-delivery-boy monthly performance & earnings"
      data={DATA}
      searchKeys={["driver"]}
      actionLabel="Export Payroll"
      onAction={() => toast.success("Exporting payroll...")}
      columns={[
        { key: "id", header: "Report ID" },
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
        { key: "deliveries", header: "Deliveries", align: "right", render: (r) => <span className="font-semibold text-[#111827]">{r.deliveries}</span> },
        { key: "distance", header: "Distance (km)", align: "right", render: (r) => <span className="text-[#4B5563]">{r.distance.toLocaleString()}</span> },
        { key: "hoursOnline", header: "Online (hrs)", align: "right", render: (r) => <span className="text-[#4B5563]">{r.hoursOnline}</span> },
        { key: "earnings", header: "Earnings", align: "right", render: (r) => <span className="font-bold text-emerald-600">${r.earnings.toLocaleString()}</span> },
        { key: "period", header: "Period" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.id}`)}
              onEdit={() => toast.info(`Generating PDF for ${r.id}`)}
            />
          ),
        },
      ]}
    />
  );
}
