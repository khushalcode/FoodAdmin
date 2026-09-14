"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { HandCoins, Loader2, Banknote, CreditCard, Wallet } from "lucide-react";
import { PageHeader, ContentCard } from "../../shared/list-page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchOnce, timeAgo } from "../use-vendor-data";
import type { AuthVendor } from "../../login-page";

interface VendorWithdrawalsProps {
  vendor: AuthVendor | null;
}

interface Withdrawal {
  id: string;
  amount: number;
  method: string;
  status: string;
  note: string | null;
  time: string;
}

const METHOD_BADGE: Record<string, string> = {
  bank: "bg-blue-50 text-blue-700 border-blue-200",
  paypal: "bg-indigo-50 text-indigo-700 border-indigo-200",
  wallet: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const METHOD_ICON: Record<string, typeof Banknote> = {
  bank: Banknote,
  paypal: CreditCard,
  wallet: Wallet,
};

export default function VendorWithdrawals({ vendor }: VendorWithdrawalsProps) {
  const url = vendor ? `/api/vendor/withdrawals?vendorId=${vendor.id}` : null;
  const { data: withdrawals, loading, forceRefresh } = useFetchOnce<Withdrawal[]>(url);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const list = withdrawals || [];
  const totalPending = list.filter((w) => w.status === "pending").reduce((s, w) => s + w.amount, 0);
  const totalPaid = list.filter((w) => w.status === "paid").reduce((s, w) => s + w.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) {
      toast.error("Vendor not loaded yet");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > vendor.balance) {
      toast.error("Amount exceeds your available balance");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: vendor.id, amount: amt, method, note: note.trim() || undefined }),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit withdrawal");
        setSubmitting(false);
        return;
      }
      toast.success("Withdrawal request submitted!", {
        description: `$${amt.toFixed(2)} via ${method}${note ? ` · ${note.slice(0, 50)}` : ""}`,
      });
      setAmount("");
      setNote("");
      setMethod("bank");
      forceRefresh();
    } catch {
      toast.error("Network error — please try again");
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Withdrawals"
        description="Request a payout and view your withdrawal history"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Request form */}
        <ContentCard className="lg:col-span-1 overflow-hidden h-fit sticky top-20">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#111827]">Request Withdrawal</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Available: <span className="font-semibold text-emerald-600">${(vendor?.balance || 0).toFixed(2)}</span>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-[#374151] text-sm font-medium">
                Amount ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#374151] text-sm font-medium">Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">🏦 Bank Transfer</SelectItem>
                  <SelectItem value="paypal">💳 PayPal</SelectItem>
                  <SelectItem value="wallet">👛 Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-[#374151] text-sm font-medium">
                Note (optional)
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for your records..."
                className="min-h-[80px] rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !vendor}
              className="w-full h-11 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold text-sm shadow-sm disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <HandCoins className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </form>
        </ContentCard>

        {/* History */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <ContentCard className="p-5">
              <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Pending</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">${totalPending.toFixed(2)}</p>
            </ContentCard>
            <ContentCard className="p-5">
              <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Paid Out</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">${totalPaid.toFixed(2)}</p>
            </ContentCard>
          </div>

          {/* History list */}
          <ContentCard className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#111827]">History</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">{list.length} withdrawal requests</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  forceRefresh();
                  toast.success("History refreshed");
                }}
                className="text-primary hover:bg-blue-50 h-8 text-xs"
              >
                Refresh
              </Button>
            </div>
            {loading ? (
              <div className="p-5 space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="p-12 text-center">
                <HandCoins className="w-10 h-10 mx-auto text-[#9CA3AF] mb-3" />
                <p className="text-sm text-[#6B7280]">No withdrawals yet. Submit your first request using the form on the left.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F9FAFB] text-left text-[11px] uppercase tracking-wide text-[#6B7280]">
                      <th className="px-5 py-2.5 font-medium">Amount</th>
                      <th className="px-5 py-2.5 font-medium">Method</th>
                      <th className="px-5 py-2.5 font-medium">Status</th>
                      <th className="px-5 py-2.5 font-medium">Note</th>
                      <th className="px-5 py-2.5 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((w, i) => {
                      const MIcon = METHOD_ICON[w.method] || Banknote;
                      return (
                        <motion.tr
                          key={w.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                        >
                          <td className="px-5 py-3 font-semibold text-[#111827]">${w.amount.toFixed(2)}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border capitalize ${METHOD_BADGE[w.method] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                              <MIcon className="w-3 h-3" />
                              {w.method}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border capitalize ${STATUS_BADGE[w.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[#4B5563] max-w-[200px] truncate">{w.note || "—"}</td>
                          <td className="px-5 py-3 text-right text-xs text-[#9CA3AF]">{timeAgo(w.time)}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
