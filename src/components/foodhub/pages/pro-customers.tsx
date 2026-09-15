"use client";

import { toast } from "sonner";
import { CrudListTable, type Column } from "../shared/crud-list-table";
import { TableActionButtons } from "../shared/list-page";
import { useCrud } from "@/hooks/use-crud";

interface ProSub {
  id: string;
  userName: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
}

const FALLBACK: ProSub[] = [
  { id: "PC-01", userName: "Sophia Patel", planName: "Gold", status: "Active", startDate: "2025-12-01", endDate: "2026-12-01" },
  { id: "PC-02", userName: "Emma Garcia", planName: "Platinum", status: "Active", startDate: "2025-03-15", endDate: "2026-03-15" },
  { id: "PC-03", userName: "Ethan Davis", planName: "Gold", status: "Active", startDate: "2025-11-28", endDate: "2026-11-28" },
  { id: "PC-04", userName: "Olivia Martin", planName: "Silver", status: "Active", startDate: "2025-09-22", endDate: "2026-09-22" },
  { id: "PC-05", userName: "Lucas Kim", planName: "Silver", status: "Cancelled", startDate: "2025-08-12", endDate: "2025-11-12" },
];

const PLAN_COLOR: Record<string, string> = {
  Platinum: "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700",
  Gold: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700",
  Silver: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700",
};

export default function ProCustomersPage() {
  const { items, loading, update, refetch } = useCrud<ProSub>({
    endpoint: "/api/pro-customer-subscriptions",
    mapRow: (r) => ({
      id: String(r.id),
      userName: r.userName ?? r.user_name ?? "",
      planName: r.planName ?? r.plan_name ?? "",
      status: r.status ?? "Active",
      startDate: r.startDate ?? r.start_date ?? "",
      endDate: r.endDate ?? r.end_date ?? "",
    }),
    itemName: "Pro subscription",
    fallback: FALLBACK,
  });

  const handleCancel = async (s: ProSub) => {
    if (!confirm(`Cancel ${s.userName}'s ${s.planName} subscription?`)) return;
    await update(s.id, { status: "Cancelled" });
  };

  const columns: Column<ProSub>[] = [
    {
      key: "userName",
      header: "Customer",
      render: (r) => <span className="font-medium text-[#111827]">{r.userName}</span>,
    },
    {
      key: "planName",
      header: "Plan",
      render: (r) => (
        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${PLAN_COLOR[r.planName] ?? "bg-gray-100 text-gray-700"}`}>
          {r.planName}
        </span>
      ),
    },
    { key: "status", header: "Status" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <TableActionButtons
          onView={() => toast.info(`Viewing ${r.userName}'s subscription`)}
          onEdit={
            r.status === "Active"
              ? () => handleCancel(r)
              : undefined
          }
        />
      ),
    },
  ];

  return (
    <CrudListTable<ProSub>
      title="Pro Customers"
      description="Premium subscription customers"
      items={items}
      loading={loading}
      columns={columns}
      searchKeys={["userName", "planName"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Active", value: "active", match: (r) => r.status === "Active" },
        { label: "Cancelled", value: "cancelled", match: (r) => r.status === "Cancelled" },
      ]}
      onRefresh={refetch}
      emptyMessage="No pro subscriptions found."
    />
  );
}
