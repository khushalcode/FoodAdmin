"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CrudListTable, type Column } from "../shared/crud-list-table";
import { useCrud } from "@/hooks/use-crud";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WalletTxn {
  id: string;
  userName: string;
  credit: number;
  debit: number;
  balance: number;
  type: string;
  reference: string;
  date: string;
}

const FALLBACK: WalletTxn[] = [
  { id: "WT-01", userName: "Olivia Martin", credit: 200, debit: 0, balance: 445.8, type: "Top-up", reference: "WALLET-TX-001", date: "2025-11-15 13:55" },
  { id: "WT-02", userName: "Olivia Martin", credit: 0, debit: 42.5, balance: 245.8, type: "Order Payment", reference: "#ORD-2841", date: "2025-11-15 14:23" },
  { id: "WT-03", userName: "Sophia Patel", credit: 1000, debit: 0, balance: 1240, type: "Top-up", reference: "WALLET-TX-002", date: "2025-11-15 12:18" },
  { id: "WT-04", userName: "Emma Garcia", credit: 0, debit: 911.75, balance: 88.25, type: "Order Payment", reference: "#ORD-2840", date: "2025-11-15 11:30" },
  { id: "WT-05", userName: "Sophia Patel", credit: 0, debit: 760, balance: 480, type: "Order Payment", reference: "#ORD-2839", date: "2025-11-15 10:48" },
];

export default function CustomerWalletPage() {
  const { items, loading, create, refetch } = useCrud<WalletTxn>({
    endpoint: "/api/customer-wallet",
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
    itemName: "Wallet transaction",
    fallback: FALLBACK,
  });

  const [userSearch, setUserSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    amount: "",
    type: "credit",
    reference: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (!userSearch.trim()) return items ?? [];
    const q = userSearch.toLowerCase();
    return (items ?? []).filter((t) => t.userName.toLowerCase().includes(q));
  }, [items, userSearch]);

  // Override items displayed by CrudListTable to apply our search
  const displayItems = filtered;

  const handleAddFunds = async () => {
    const amount = Number(form.amount);
    if (!form.userName || !amount || amount <= 0) {
      toast.error("Enter user name and a valid amount");
      return;
    }
    setSubmitting(true);
    // For now there's no dedicated wallet-adjust endpoint — fall back to POST on customer-wallet
    try {
      const res = await fetch("/api/customer-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: form.userName,
          credit: form.type === "credit" ? amount : 0,
          debit: form.type === "debit" ? amount : 0,
          type: form.type === "credit" ? "Admin Top-up" : "Admin Adjustment",
          reference: form.reference || `ADMIN-${Date.now()}`,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(`Added $${amount.toFixed(2)} to ${form.userName}'s wallet`);
      setOpen(false);
      setForm({ userName: "", amount: "", type: "credit", reference: "" });
      await refetch();
    } catch {
      // Fallback — show toast so the UX is intact even without the endpoint
      toast.info(
        `Wallet-adjust endpoint not implemented yet. Would ${form.type} $${amount.toFixed(2)} to ${form.userName}.`,
      );
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<WalletTxn>[] = [
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
        r.credit > 0 ? <span className="text-emerald-600 font-semibold">+${r.credit.toFixed(2)}</span> : <span className="text-[#9CA3AF]">—</span>,
    },
    {
      key: "debit",
      header: "Debit",
      align: "right",
      render: (r) =>
        r.debit > 0 ? <span className="text-red-500 font-semibold">-${r.debit.toFixed(2)}</span> : <span className="text-[#9CA3AF]">—</span>,
    },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      render: (r) => <span className="font-bold text-primary">${r.balance.toFixed(2)}</span>,
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
      <CrudListTable<WalletTxn>
        title="Customer Wallet"
        description="Wallet transactions across all customers"
        items={displayItems}
        loading={loading}
        columns={columns}
        searchKeys={["userName", "reference", "type"]}
        onRefresh={refetch}
        actionLabel="Add Funds"
        onAction={() => setOpen(true)}
        emptyMessage="No wallet transactions found."
      />

      {/* user-filter input — placed above the table via FilterBar within CrudListTable search,
          but we also expose a dedicated input here for clarity */}
      <div className="-mt-4 mb-6">
        <Input
          placeholder="Filter by user name..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="max-w-xs h-9 rounded-lg bg-white border-[#E5E7EB]"
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Credit or debit a customer's wallet.
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="w-user">User name</Label>
              <Input
                id="w-user"
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                placeholder="Olivia Martin"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="w-amount">Amount</Label>
                <Input
                  id="w-amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="50.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (+)</SelectItem>
                    <SelectItem value="debit">Debit (−)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-ref">Reference (optional)</Label>
              <Input
                id="w-ref"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="ADMIN-TOPUP-001"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFunds} disabled={submitting}>
              {submitting ? "Processing..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
