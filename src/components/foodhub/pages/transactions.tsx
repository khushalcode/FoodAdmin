"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "../shared/list-page";

type TxnType = "all" | "orders" | "withdrawals" | "disbursements" | "wallet";

interface Txn {
  id: string;
  type: string;
  amount: number;
  status: string;
  party: string;
  date: string;
  category: "orders" | "withdrawals" | "disbursements" | "wallet";
}

const FALLBACK: Txn[] = [
  { id: "TXN-9821", type: "Order Payment", amount: 42.5, status: "Completed", party: "Olivia Martin", date: "2025-11-15 14:23", category: "orders" },
  { id: "TXN-9820", type: "Wallet Top-up", amount: 200, status: "Completed", party: "Sophia Patel", date: "2025-11-15 13:55", category: "wallet" },
  { id: "TXN-9819", type: "Order Payment", amount: 28.99, status: "Completed", party: "Liam Chen", date: "2025-11-15 13:42", category: "orders" },
  { id: "TXN-9818", type: "Refund", amount: -54, status: "Completed", party: "Mason Brown", date: "2025-11-15 12:18", category: "orders" },
  { id: "TXN-9817", type: "Payout", amount: -2150, status: "Completed", party: "Tandoori House", date: "2025-11-15 10:48", category: "withdrawals" },
  { id: "TXN-9816", type: "DM Disbursement", amount: -3840, status: "Processing", party: "Carlos Rivera", date: "2025-11-15 09:30", category: "disbursements" },
  { id: "TXN-9815", type: "Wallet Top-up", amount: 100, status: "Completed", party: "Olivia Martin", date: "2025-11-15 09:15", category: "wallet" },
  { id: "TXN-9814", type: "Order Payment", amount: 38.2, status: "Failed", party: "Emma Garcia", date: "2025-11-15 08:42", category: "orders" },
];

const FILTERS: { label: string; value: TxnType }[] = [
  { label: "All", value: "all" },
  { label: "Orders", value: "orders" },
  { label: "Withdrawals", value: "withdrawals" },
  { label: "Disbursements", value: "disbursements" },
  { label: "Wallet", value: "wallet" },
];

export default function TransactionsPage() {
  const [filter, setFilter] = useState<TxnType>("all");
  const [items, setItems] = useState<Txn[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/transactions?type=${filter}&limit=100`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const arr: Txn[] = Array.isArray(json) ? json : (json.items ?? []);
        if (!cancelled) setItems(arr.length > 0 ? arr : FALLBACK);
      } catch {
        if (!cancelled) setItems(FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const filtered = useMemo(() => {
    const arr = items ?? [];
    if (filter === "all") return arr;
    return arr.filter((t) => t.category === filter);
  }, [items, filter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#111827]">Transactions</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          All financial transactions across FoodHub
        </p>
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`h-9 px-3.5 rounded-lg text-xs font-medium border transition-colors ${
              filter === f.value
                ? "bg-primary text-white border-primary"
                : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F9FAFB]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="rounded-2xl shadow-soft border-[#E5E7EB]">
        <CardHeader className="border-b border-[#F3F4F6] pb-4">
          <CardTitle className="text-base text-[#111827]">
            Transactions
          </CardTitle>
          <p className="text-xs text-[#6B7280]">
            {filtered.length} records · filter: {filter}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#6B7280]">
              No transactions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">ID</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground text-right">Amount</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Party</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r, i) => {
                  const positive = r.amount >= 0;
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}
                      className="border-t border-[#F3F4F6] hover:bg-muted/30"
                    >
                      <TableCell className="py-3 text-sm font-mono font-semibold text-primary">{r.id}</TableCell>
                      <TableCell className="py-3 text-sm">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {r.type}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-sm text-right">
                        <span className={`font-bold inline-flex items-center gap-0.5 ${positive ? "text-emerald-600" : "text-red-600"}`}>
                          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {positive ? "+" : "-"}${Math.abs(r.amount).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-sm"><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="py-3 text-sm text-[#111827]">{r.party}</TableCell>
                      <TableCell className="py-3 text-sm text-[#6B7280]">{r.date}</TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
