"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: string;
  value: string;
  used: number;
  limit: number;
  expiry: string;
  status: string;
}

const DATA: Coupon[] = [
  { id: "1", code: "WELCOME10", description: "10% off first order", type: "Percentage", value: "10%", used: 412, limit: 1000, expiry: "2025-12-31", status: "Active" },
  { id: "2", code: "PIZZA50", description: "$5 off any pizza", type: "Flat", value: "$5", used: 318, limit: 500, expiry: "2025-11-30", status: "Active" },
  { id: "3", code: "FREESHIP", description: "Free delivery", type: "Free Delivery", value: "$0", used: 928, limit: 2000, expiry: "2025-12-15", status: "Active" },
  { id: "4", code: "WEEKEND25", description: "25% off weekend orders", type: "Percentage", value: "25%", used: 156, limit: 300, expiry: "2025-11-25", status: "Active" },
  { id: "5", code: "SUSHI15", description: "15% off sushi orders", type: "Percentage", value: "15%", used: 89, limit: 200, expiry: "2025-11-10", status: "Expired" },
  { id: "6", code: "BIGORDER30", description: "30% off orders over $50", type: "Percentage", value: "30%", used: 234, limit: 500, expiry: "2025-12-31", status: "Active" },
  { id: "7", code: "NEWUSER20", description: "$20 off first order over $40", type: "Flat", value: "$20", used: 67, limit: 100, expiry: "2025-11-30", status: "Active" },
  { id: "8", code: "HOLIDAY50", description: "50% off holiday special", type: "Percentage", value: "50%", used: 0, limit: 1000, expiry: "2025-12-25", status: "Scheduled" },
  { id: "9", code: "LUNCH15", description: "$15 lunch combo", type: "Flat", value: "$15", used: 412, limit: 1000, expiry: "2025-10-31", status: "Expired" },
];

export default function CouponsPage() {
  return (
    <ListTable<Coupon>
      title="Coupons"
      description="Discount codes customers can apply at checkout"
      data={DATA}
      searchKeys={["code", "description"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Active", value: "active", match: (r) => r.status === "Active" },
        { label: "Expired", value: "expired", match: (r) => r.status === "Expired" },
        { label: "Scheduled", value: "scheduled", match: (r) => r.status === "Scheduled" },
      ]}
      actionLabel="Create Coupon"
      onAction={() => toast.success("Opening coupon form...")}
      columns={[
        { key: "code", header: "Code", render: (r) => <span className="font-mono font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded-md text-xs">{r.code}</span> },
        { key: "description", header: "Description" },
        { key: "type", header: "Type", render: (r) => <span className="inline-block px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-medium">{r.type}</span> },
        { key: "value", header: "Discount", align: "right", render: (r) => <span className="font-semibold text-emerald-600">{r.value}</span> },
        {
          key: "used",
          header: "Usage",
          align: "right",
          render: (r) => <span className="text-[#4B5563]">{r.used} / {r.limit}</span>,
        },
        { key: "expiry", header: "Expires" },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.code}`)}
              onEdit={() => toast.info(`Editing ${r.code}`)}
              onDelete={() => toast.error(`Deleting ${r.code}`)}
            />
          ),
        },
      ]}
    />
  );
}
