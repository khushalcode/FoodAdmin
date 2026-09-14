"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown } from "lucide-react";

interface Pro {
  id: string;
  name: string;
  email: string;
  plan: string;
  points: number;
  savings: number;
  renewed: string;
  status: string;
}

const DATA: Pro[] = [
  { id: "PC-01", name: "Sophia Patel", email: "sophia.p@email.com", plan: "Gold", points: 4820, savings: 412, renewed: "2025-12-01", status: "Active" },
  { id: "PC-02", name: "Emma Garcia", email: "emma.g@email.com", plan: "Platinum", points: 8240, savings: 928, renewed: "2026-03-15", status: "Active" },
  { id: "PC-03", name: "Ethan Davis", email: "ethan.d@email.com", plan: "Gold", points: 3120, savings: 284, renewed: "2025-11-28", status: "Active" },
  { id: "PC-04", name: "Olivia Martin", email: "olivia.m@email.com", plan: "Silver", points: 1840, savings: 142, renewed: "2025-09-22", status: "Active" },
  { id: "PC-05", name: "Lucas Kim", email: "lucas.k@email.com", plan: "Silver", points: 2240, savings: 198, renewed: "2025-08-12", status: "Expired" },
  { id: "PC-06", name: "Ava Rodriguez", email: "ava.r@email.com", plan: "Platinum", points: 9820, savings: 1240, renewed: "2026-01-08", status: "Active" },
  { id: "PC-07", name: "Liam Chen", email: "liam.chen@email.com", plan: "Gold", points: 4180, savings: 367, renewed: "2025-12-25", status: "Active" },
];

const PLAN_COLOR: Record<string, string> = {
  Platinum: "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700",
  Gold: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700",
  Silver: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700",
};

const AVATAR_COLORS = ["from-violet-500 to-purple-600", "from-pink-500 to-rose-600", "from-amber-500 to-orange-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600", "from-cyan-500 to-blue-600"];

export default function ProCustomersPage() {
  return (
    <ListTable<Pro>
      title="Pro Customers"
      description="Premium subscribers on FoodHub loyalty program"
      data={DATA}
      searchKeys={["name", "email", "plan"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Platinum", value: "platinum", match: (r) => r.plan === "Platinum" },
        { label: "Gold", value: "gold", match: (r) => r.plan === "Gold" },
        { label: "Silver", value: "silver", match: (r) => r.plan === "Silver" },
      ]}
      actionLabel="Invite Pro"
      onAction={() => toast.success("Opening invitation form...")}
      columns={[
        {
          key: "name",
          header: "Customer",
          render: (r, i) => (
            <div className="flex items-center gap-2.5">
              <Avatar className="w-9 h-9 rounded-full">
                <AvatarFallback className={`bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white text-xs rounded-full font-semibold`}>
                  {r.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-[#111827] inline-flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                  {r.name}
                </p>
                <p className="text-xs text-[#9CA3AF]">{r.email}</p>
              </div>
            </div>
          ),
        },
        { key: "plan", header: "Plan", render: (r) => <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${PLAN_COLOR[r.plan]}`}>{r.plan}</span> },
        { key: "points", header: "Loyalty Points", align: "right", render: (r) => <span className="font-semibold text-primary">{r.points.toLocaleString()}</span> },
        { key: "savings", header: "Total Savings", align: "right", render: (r) => <span className="font-semibold text-emerald-600">${r.savings}</span> },
        { key: "renewed", header: "Renews" },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.name}`)}
              onEdit={() => toast.info(`Managing ${r.name} subscription`)}
              onDelete={() => toast.error(`Cancelling ${r.name} pro plan`)}
            />
          ),
        },
      ]}
    />
  );
}
