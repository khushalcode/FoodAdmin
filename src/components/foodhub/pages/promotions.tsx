"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Promotion {
  id: string;
  name: string;
  type: string;
  target: string;
  value: string;
  used: number;
  redeemed: number;
  status: string;
}

const DATA: Promotion[] = [
  { id: "P-01", name: "Buy 1 Get 1 Pizza", type: "BOGO", target: "Pizza Category", value: "1+1", used: 412, redeemed: 318, status: "Active" },
  { id: "P-02", name: "Free Drink with Combo", type: "Bundle", target: "Combos", value: "+1 Drink", used: 287, redeemed: 234, status: "Active" },
  { id: "P-03", name: "20% Off for Students", type: "Segment", target: "Students", value: "20%", used: 156, redeemed: 124, status: "Active" },
  { id: "P-04", name: "Birthday Treat", type: "Auto-apply", target: "Birthday Users", value: "$10", used: 89, redeemed: 76, status: "Active" },
  { id: "P-05", name: "First Order Free Delivery", type: "Auto-apply", target: "New Users", value: "$0", used: 924, redeemed: 812, status: "Active" },
  { id: "P-06", name: "Group Order Discount", type: "Threshold", target: "Orders > $100", value: "15%", used: 78, redeemed: 64, status: "Active" },
  { id: "P-07", name: "Midnight Munchies", type: "Time-based", target: "12 AM - 4 AM", value: "10%", used: 234, redeemed: 198, status: "Inactive" },
  { id: "P-08", name: "Loyalty Triple Points", type: "Loyalty", target: "Pro Members", value: "3x", used: 412, redeemed: 354, status: "Active" },
];

export default function PromotionsPage() {
  return (
    <ListTable<Promotion>
      title="Promotions"
      description="Targeted offers and automatic discounts"
      data={DATA}
      searchKeys={["name", "target"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Active", value: "active", match: (r) => r.status === "Active" },
        { label: "Inactive", value: "inactive", match: (r) => r.status === "Inactive" },
      ]}
      actionLabel="Create Promotion"
      onAction={() => toast.success("Opening promotion form...")}
      columns={[
        { key: "id", header: "ID" },
        { key: "name", header: "Promotion", render: (r) => <span className="font-semibold text-[#111827]">{r.name}</span> },
        { key: "type", header: "Type", render: (r) => <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-primary text-xs font-medium">{r.type}</span> },
        { key: "target", header: "Target" },
        { key: "value", header: "Value", align: "right", render: (r) => <span className="font-semibold text-emerald-600">{r.value}</span> },
        { key: "used", header: "Used", align: "right", render: (r) => <span className="text-[#4B5563]">{r.used}</span> },
        { key: "redeemed", header: "Redeemed", align: "right", render: (r) => <span className="font-semibold text-[#111827]">{r.redeemed}</span> },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.name}`)}
              onEdit={() => toast.info(`Editing ${r.name}`)}
              onDelete={() => toast.error(`Deleting ${r.name}`)}
            />
          ),
        },
      ]}
    />
  );
}
