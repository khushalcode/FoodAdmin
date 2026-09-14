"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DM {
  id: string;
  name: string;
  phone: string;
  zone: string;
  deliveries: number;
  rating: number;
  earnings: number;
  status: string;
}

const DATA: DM[] = [
  { id: "DM-01", name: "Carlos Rivera", phone: "+1 555 0142", zone: "Downtown", deliveries: 248, rating: 4.9, earnings: 3840, status: "Online" },
  { id: "DM-02", name: "Aisha Khan", phone: "+1 555 0198", zone: "Uptown", deliveries: 312, rating: 4.8, earnings: 4120, status: "On Delivery" },
  { id: "DM-03", name: "David Park", phone: "+1 555 0245", zone: "Westside", deliveries: 188, rating: 4.7, earnings: 2840, status: "Online" },
  { id: "DM-04", name: "Maria Santos", phone: "+1 555 0312", zone: "Eastside", deliveries: 412, rating: 4.9, earnings: 5280, status: "Busy" },
  { id: "DM-05", name: "James Wilson", phone: "+1 555 0356", zone: "Midtown", deliveries: 96, rating: 4.6, earnings: 1420, status: "Offline" },
  { id: "DM-06", name: "Fatima Ali", phone: "+1 555 0402", zone: "Suburb", deliveries: 224, rating: 4.8, earnings: 3240, status: "Online" },
  { id: "DM-07", name: "Robert Chen", phone: "+1 555 0456", zone: "Downtown", deliveries: 312, rating: 4.7, earnings: 4480, status: "On Delivery" },
  { id: "DM-08", name: "Sara Mohamed", phone: "+1 555 0512", zone: "Uptown", deliveries: 158, rating: 4.5, earnings: 2340, status: "Online" },
];

const AVATAR_COLORS = ["from-orange-500 to-red-600", "from-violet-500 to-purple-600", "from-blue-500 to-cyan-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-pink-500 to-rose-600", "from-cyan-500 to-blue-600", "from-indigo-500 to-violet-600"];

export default function DeliveryBoysPage() {
  return (
    <ListTable<DM>
      title="Delivery Boys"
      description="Delivery personnel currently on FoodHub"
      data={DATA}
      searchKeys={["name", "phone", "zone"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Online", value: "online", match: (r) => r.status === "Online" },
        { label: "Busy", value: "busy", match: (r) => r.status === "Busy" },
        { label: "On Delivery", value: "ondelivery", match: (r) => r.status === "On Delivery" },
        { label: "Offline", value: "offline", match: (r) => r.status === "Offline" },
      ]}
      actionLabel="Add Delivery Boy"
      onAction={() => toast.success("Opening delivery boy form...")}
      columns={[
        {
          key: "name",
          header: "Delivery Boy",
          render: (r, i) => (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Avatar className="w-9 h-9 rounded-full">
                  <AvatarFallback className={`bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white text-xs rounded-full font-semibold`}>
                    {r.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  r.status === "Online" ? "bg-emerald-500" : r.status === "Busy" ? "bg-amber-500" : r.status === "On Delivery" ? "bg-blue-500" : "bg-gray-300"
                }`} />
              </div>
              <div>
                <p className="font-medium text-[#111827]">{r.name}</p>
                <p className="text-xs text-[#9CA3AF]">{r.phone}</p>
              </div>
            </div>
          ),
        },
        { key: "zone", header: "Zone" },
        { key: "deliveries", header: "Deliveries", align: "right", render: (r) => <span className="font-semibold text-[#111827]">{r.deliveries}</span> },
        { key: "rating", header: "Rating", align: "right", render: (r) => <span className="inline-flex items-center gap-0.5 text-amber-600"><span className="text-amber-400">★</span>{r.rating}</span> },
        { key: "earnings", header: "Earnings", align: "right", render: (r) => <span className="font-semibold text-emerald-600">${r.earnings.toLocaleString()}</span> },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.name}`)}
              onEdit={() => toast.info(`Editing ${r.name}`)}
              onDelete={() => toast.error(`Removing ${r.name}`)}
            />
          ),
        },
      ]}
    />
  );
}
