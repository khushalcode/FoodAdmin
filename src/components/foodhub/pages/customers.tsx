"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  lastOrder: string;
  joined: string;
  status: string;
}

const DATA: Customer[] = [
  { id: "C-001", name: "Olivia Martin", email: "olivia.m@email.com", orders: 42, spent: 1284.5, lastOrder: "2 days ago", joined: "2024-03-15", status: "Verified" },
  { id: "C-002", name: "Liam Chen", email: "liam.chen@email.com", orders: 38, spent: 942.8, lastOrder: "5 days ago", joined: "2024-04-22", status: "Verified" },
  { id: "C-003", name: "Sophia Patel", email: "sophia.p@email.com", orders: 56, spent: 1864.2, lastOrder: "1 day ago", joined: "2024-01-08", status: "Verified" },
  { id: "C-004", name: "Noah Williams", email: "noah.w@email.com", orders: 12, spent: 348.7, lastOrder: "1 week ago", joined: "2024-09-10", status: "Verified" },
  { id: "C-005", name: "Emma Garcia", email: "emma.g@email.com", orders: 78, spent: 2456.9, lastOrder: "3 hours ago", joined: "2023-11-20", status: "Verified" },
  { id: "C-006", name: "Mason Brown", email: "mason.b@email.com", orders: 5, spent: 124.5, lastOrder: "2 weeks ago", joined: "2024-10-01", status: "Unverified" },
  { id: "C-007", name: "Ava Rodriguez", email: "ava.r@email.com", orders: 34, spent: 712.4, lastOrder: "4 days ago", joined: "2024-05-18", status: "Verified" },
  { id: "C-008", name: "Lucas Kim", email: "lucas.k@email.com", orders: 19, spent: 488.0, lastOrder: "1 week ago", joined: "2024-07-25", status: "Verified" },
  { id: "C-009", name: "Mia Nguyen", email: "mia.n@email.com", orders: 22, spent: 654.2, lastOrder: "1 month ago", joined: "2024-06-12", status: "Unverified" },
  { id: "C-010", name: "Ethan Davis", email: "ethan.d@email.com", orders: 47, spent: 1424.8, lastOrder: "Yesterday", joined: "2024-02-28", status: "Verified" },
];

const COLORS = ["from-pink-500 to-rose-600", "from-blue-500 to-indigo-600", "from-violet-500 to-purple-600", "from-amber-500 to-orange-600", "from-emerald-500 to-teal-600", "from-cyan-500 to-blue-600", "from-rose-500 to-pink-600", "from-orange-500 to-red-600", "from-teal-500 to-cyan-600", "from-indigo-500 to-violet-600"];

export default function CustomersPage() {
  return (
    <ListTable<Customer>
      title="Customers"
      description="All registered customers on FoodHub"
      data={DATA}
      searchKeys={["name", "email"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Verified", value: "verified", match: (r) => r.status === "Verified" },
        { label: "Unverified", value: "unverified", match: (r) => r.status === "Unverified" },
      ]}
      actionLabel="Add Customer"
      onAction={() => toast.success("Opening customer form...")}
      columns={[
        {
          key: "name",
          header: "Customer",
          render: (r, i) => (
            <div className="flex items-center gap-2.5">
              <Avatar className="w-9 h-9 rounded-full">
                <AvatarFallback className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full font-semibold`}>
                  {r.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-[#111827]">{r.name}</p>
                <p className="text-xs text-[#9CA3AF]">{r.email}</p>
              </div>
            </div>
          ),
        },
        { key: "id", header: "ID", render: (r) => <span className="font-mono text-xs text-[#6B7280]">{r.id}</span> },
        { key: "orders", header: "Orders", align: "right", render: (r) => <span className="font-semibold text-[#111827]">{r.orders}</span> },
        { key: "spent", header: "Total Spent", align: "right", render: (r) => <span className="font-semibold text-emerald-600">${r.spent.toFixed(2)}</span> },
        { key: "lastOrder", header: "Last Order" },
        { key: "joined", header: "Joined" },
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
