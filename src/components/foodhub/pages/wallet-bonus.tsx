"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Bonus {
  id: string;
  name: string;
  type: string;
  bonus: string;
  redeemed: number;
  start: string;
  end: string;
  status: string;
}

const DATA: Bonus[] = [
  { id: "WB-01", name: "First Top-up Bonus", type: "Welcome", bonus: "+$10 on $50", redeemed: 412, start: "2025-10-01", end: "2025-12-31", status: "Active" },
  { id: "WB-02", name: "Eid Special Top-up", type: "Festival", bonus: "+15% on any", redeemed: 318, start: "2025-04-10", end: "2025-04-20", status: "Expired" },
  { id: "WB-03", name: "Friday Top-up 5%", type: "Weekly", bonus: "+5%", redeemed: 924, start: "2025-01-01", end: "2025-12-31", status: "Active" },
  { id: "WB-04", name: "Diwali Dhamaka", type: "Festival", bonus: "+20% on $100+", redeemed: 0, start: "2025-11-12", end: "2025-11-15", status: "Scheduled" },
  { id: "WB-05", name: "Holiday Triple", type: "Festival", bonus: "+30%", redeemed: 0, start: "2025-12-24", end: "2025-12-26", status: "Scheduled" },
  { id: "WB-06", name: "Monthly Loyalty", type: "Loyalty", bonus: "+$5 monthly", redeemed: 1240, start: "2025-01-01", end: "2025-12-31", status: "Active" },
  { id: "WB-07", name: "New Year Reload", type: "Festival", bonus: "+10%", redeemed: 0, start: "2026-01-01", end: "2026-01-07", status: "Draft" },
];

export default function WalletBonusPage() {
  return (
    <ListTable<Bonus>
      title="Wallet Bonus"
      description="Promotional wallet top-up bonuses for customers"
      data={DATA}
      searchKeys={["name"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Active", value: "active", match: (r) => r.status === "Active" },
        { label: "Scheduled", value: "scheduled", match: (r) => r.status === "Scheduled" },
        { label: "Expired", value: "expired", match: (r) => r.status === "Expired" },
        { label: "Draft", value: "draft", match: (r) => r.status === "Draft" },
      ]}
      actionLabel="Create Bonus"
      onAction={() => toast.success("Opening bonus form...")}
      columns={[
        { key: "id", header: "ID" },
        { key: "name", header: "Bonus Name", render: (r) => <span className="font-semibold text-[#111827]">{r.name}</span> },
        { key: "type", header: "Type", render: (r) => <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-xs font-medium">{r.type}</span> },
        { key: "bonus", header: "Bonus", render: (r) => <span className="font-semibold text-emerald-600">{r.bonus}</span> },
        { key: "redeemed", header: "Redeemed", align: "right", render: (r) => <span className="font-medium text-[#111827]">{r.redeemed.toLocaleString()}</span> },
        { key: "start", header: "Start" },
        { key: "end", header: "End" },
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
