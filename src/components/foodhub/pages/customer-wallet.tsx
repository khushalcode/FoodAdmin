"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Wallet {
  id: string;
  customer: string;
  balance: number;
  currency: string;
  spent: number;
  topup: number;
  lastTxn: string;
  status: string;
}

const DATA: Wallet[] = [
  { id: "W-01", customer: "Olivia Martin", balance: 245.8, currency: "USD", spent: 182.5, topup: 500, lastTxn: "2h ago", status: "Active" },
  { id: "W-02", customer: "Liam Chen", balance: 0, currency: "USD", spent: 412.0, topup: 412, lastTxn: "1d ago", status: "Active" },
  { id: "W-03", customer: "Sophia Patel", balance: 1240.0, currency: "USD", spent: 760, topup: 2000, lastTxn: "5h ago", status: "Active" },
  { id: "W-04", customer: "Emma Garcia", balance: 88.25, currency: "USD", spent: 911.75, topup: 1000, lastTxn: "3h ago", status: "Active" },
  { id: "W-05", customer: "Noah Williams", balance: 15.0, currency: "USD", spent: 285, topup: 300, lastTxn: "1 week ago", status: "Active" },
  { id: "W-06", customer: "Ava Rodriguez", balance: 540.0, currency: "USD", spent: 460, topup: 1000, lastTxn: "Yesterday", status: "Active" },
  { id: "W-07", customer: "Lucas Kim", balance: 0, currency: "USD", spent: 248, topup: 248, lastTxn: "2 weeks ago", status: "Frozen" },
  { id: "W-08", customer: "Mia Nguyen", balance: 320.0, currency: "USD", spent: 180, topup: 500, lastTxn: "4 days ago", status: "Active" },
];

const AVATAR_COLORS = ["from-pink-500 to-rose-600", "from-blue-500 to-indigo-600", "from-violet-500 to-purple-600", "from-amber-500 to-orange-600", "from-emerald-500 to-teal-600", "from-cyan-500 to-blue-600", "from-rose-500 to-pink-600", "from-orange-500 to-red-600"];

export default function CustomerWalletPage() {
  return (
    <ListTable<Wallet>
      title="Customer Wallet"
      description="Wallet balances for all customers"
      data={DATA}
      searchKeys={["customer"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Active", value: "active", match: (r) => r.status === "Active" },
        { label: "Frozen", value: "frozen", match: (r) => r.status === "Frozen" },
      ]}
      actionLabel="Top Up"
      onAction={() => toast.success("Opening top-up form...")}
      columns={[
        {
          key: "customer",
          header: "Customer",
          render: (r, i) => (
            <div className="flex items-center gap-2.5">
              <Avatar className="w-9 h-9 rounded-full">
                <AvatarFallback className={`bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white text-xs rounded-full font-semibold`}>
                  {r.customer.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-[#111827]">{r.customer}</p>
                <p className="text-xs text-[#9CA3AF]">{r.id} · {r.currency}</p>
              </div>
            </div>
          ),
        },
        { key: "balance", header: "Balance", align: "right", render: (r) => <span className={`font-bold ${r.balance > 0 ? "text-primary" : "text-[#9CA3AF]"}`}>${r.balance.toFixed(2)}</span> },
        { key: "topup", header: "Total Top-up", align: "right", render: (r) => <span className="text-[#4B5563]">${r.topup.toFixed(2)}</span> },
        { key: "spent", header: "Total Spent", align: "right", render: (r) => <span className="text-red-500">-${r.spent.toFixed(2)}</span> },
        { key: "lastTxn", header: "Last Transaction" },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.customer} wallet`)}
              onEdit={() => toast.info(`Adjusting ${r.customer} balance`)}
              onDelete={() => toast.error(`Freezing ${r.customer} wallet`)}
            />
          ),
        },
      ]}
    />
  );
}
