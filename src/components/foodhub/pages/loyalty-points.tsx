"use client";

import { useMemo, useState } from "react";
import { CrudListTable, type Column } from "../shared/crud-list-table";
import { useCrud } from "@/hooks/use-crud";
import { Input } from "@/components/ui/input";

interface LoyaltyTxn {
  id: string;
  userName: string;
  credit: number;
  debit: number;
  balance: number;
  type: string;
  reference: string;
  date: string;
}

const FALLBACK: LoyaltyTxn[] = [
  { id: "LP-01", userName: "Sophia Patel", credit: 50, debit: 0, balance: 4820, type: "Order Reward", reference: "#ORD-2841", date: "2025-11-15 14:23" },
  { id: "LP-02", userName: "Sophia Patel", credit: 0, debit: 200, balance: 4770, type: "Redeem", reference: "REDEEM-001", date: "2025-11-15 12:18" },
  { id: "LP-03", userName: "Emma Garcia", credit: 100, debit: 0, balance: 8240, type: "Pro Bonus", reference: "PRO-MONTH", date: "2025-11-15 11:30" },
  { id: "LP-04", userName: "Olivia Martin", credit: 25, debit: 0, balance: 1840, type: "Order Reward", reference: "#ORD-2839", date: "2025-11-15 10:48" },
  { id: "LP-05", userName: "Liam Chen", credit: 0, debit: 500, balance: 980, type: "Redeem", reference: "REDEEM-002", date: "2025-11-15 09:15" },
];

export default function LoyaltyPointsPage() {
  const { items, loading, refetch } = useCrud<LoyaltyTxn>({
    endpoint: "/api/loyalty-points",
    mapRow: (r) => ({
      id: String(r.id),
      userName: r.userName ?? r.user_name ?? "",
      credit: Number(r.credit ?? 0),
      debit: Number(r.debit ?? 0),
      balance: Number(r.balance ?? 0),
      type: r.type ?? "",
      reference: r.reference ?? "",
      date: r.date ?? "",
    }),
    itemName: "Loyalty transaction",
    fallback: FALLBACK,
  });

  const [userSearch, setUserSearch] = useState("");

  const filtered = useMemo(() => {
    if (!userSearch.trim()) return items ?? [];
    const q = userSearch.toLowerCase();
    return (items ?? []).filter((t) => t.userName.toLowerCase().includes(q));
  }, [items, userSearch]);

  const columns: Column<LoyaltyTxn>[] = [
    {
      key: "userName",
      header: "User",
      render: (r) => <span className="font-medium text-[#111827]">{r.userName}</span>,
    },
    {
      key: "credit",
      header: "Credit",
      align: "right",
      render: (r) =>
        r.credit > 0 ? <span className="text-emerald-600 font-semibold">+{r.credit}</span> : <span className="text-[#9CA3AF]">—</span>,
    },
    {
      key: "debit",
      header: "Debit",
      align: "right",
      render: (r) =>
        r.debit > 0 ? <span className="text-red-500 font-semibold">-{r.debit}</span> : <span className="text-[#9CA3AF]">—</span>,
    },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      render: (r) => <span className="font-bold text-violet-600">{r.balance.toLocaleString()}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (r) => (
        <span className="inline-block px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-medium">{r.type}</span>
      ),
    },
    {
      key: "reference",
      header: "Reference",
      render: (r) => <span className="font-mono text-xs text-[#6B7280]">{r.reference}</span>,
    },
    { key: "date", header: "Date" },
  ];

  return (
    <>
      <CrudListTable<LoyaltyTxn>
        title="Loyalty Points"
        description="Loyalty point transactions across all customers"
        items={filtered}
        loading={loading}
        columns={columns}
        searchKeys={["userName", "reference", "type"]}
        onRefresh={refetch}
        emptyMessage="No loyalty transactions found."
      />

      <div className="-mt-4 mb-6">
        <Input
          placeholder="Filter by user name..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="max-w-xs h-9 rounded-lg bg-white border-[#E5E7EB]"
        />
      </div>
    </>
  );
}
