"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Payout {
  id: string;
  restaurant: string;
  amount: number;
  method: string;
  requested: string;
  status: string;
}

const DATA: Payout[] = [
  { id: "PR-001", restaurant: "Bella Italia", amount: 1240.5, method: "Bank Transfer", requested: "2 hours ago", status: "Pending" },
  { id: "PR-002", restaurant: "Sushi Express", amount: 890.25, method: "PayPal", requested: "5 hours ago", status: "Pending" },
  { id: "PR-003", restaurant: "Tandoori House", amount: 2150.0, method: "Bank Transfer", requested: "1 day ago", status: "Approved" },
  { id: "PR-004", restaurant: "Burger Bros", amount: 670.8, method: "Stripe", requested: "2 days ago", status: "Pending" },
  { id: "PR-005", restaurant: "Pho Paradise", amount: 425.0, method: "Bank Transfer", requested: "2 days ago", status: "Approved" },
  { id: "PR-006", restaurant: "Taco Loco", amount: 312.45, method: "PayPal", requested: "3 days ago", status: "Rejected" },
  { id: "PR-007", restaurant: "Green Bowl", amount: 880.0, method: "Stripe", requested: "3 days ago", status: "Approved" },
  { id: "PR-008", restaurant: "Pizza Roma", amount: 1245.6, method: "Bank Transfer", requested: "4 days ago", status: "Approved" },
  { id: "PR-009", restaurant: "Dragon Wok", amount: 540.0, method: "PayPal", requested: "5 days ago", status: "Approved" },
  { id: "PR-010", restaurant: "Mediterraneo", amount: 920.25, method: "Stripe", requested: "1 week ago", status: "Approved" },
];

const COLORS = ["from-red-500 to-orange-600", "from-blue-500 to-cyan-600", "from-amber-500 to-orange-600", "from-yellow-500 to-amber-600", "from-green-500 to-emerald-600", "from-orange-500 to-red-600", "from-emerald-500 to-teal-600", "from-red-500 to-rose-600", "from-cyan-500 to-blue-600", "from-violet-500 to-purple-600"];

export default function PayoutRequestsPage() {
  return (
    <ListTable<Payout>
      title="Payout Requests"
      description="Withdrawal requests from restaurant partners"
      data={DATA}
      searchKeys={["id", "restaurant", "method"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Pending", value: "pending", match: (r) => r.status === "Pending" },
        { label: "Approved", value: "approved", match: (r) => r.status === "Approved" },
        { label: "Rejected", value: "rejected", match: (r) => r.status === "Rejected" },
      ]}
      actionLabel="Export"
      onAction={() => toast.success("Exporting payout requests...")}
      columns={[
        { key: "id", header: "Request ID", render: (r) => <span className="font-semibold text-primary">{r.id}</span> },
        {
          key: "restaurant",
          header: "Restaurant",
          render: (r, i) => (
            <div className="flex items-center gap-2.5">
              <Avatar className="w-8 h-8 rounded-full">
                <AvatarFallback className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} text-white text-xs rounded-full font-semibold`}>
                  {r.restaurant.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-[#111827]">{r.restaurant}</span>
            </div>
          ),
        },
        { key: "amount", header: "Amount", align: "right", render: (r) => <span className="font-semibold text-[#111827]">${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> },
        { key: "method", header: "Method", render: (r) => <span className="inline-block px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-medium">{r.method}</span> },
        { key: "requested", header: "Requested" },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.id}`)}
              onEdit={() => r.status === "Pending" ? toast.success(`Approving ${r.id}`) : toast.info(`Editing ${r.id}`)}
              onDelete={() => toast.error(`Rejecting ${r.id}`)}
            />
          ),
        },
      ]}
    />
  );
}
