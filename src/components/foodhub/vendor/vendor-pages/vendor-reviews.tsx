"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Star, Send, Loader2 } from "lucide-react";
import { PageHeader, ContentCard } from "../../shared/list-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchOnce, timeAgo } from "../use-vendor-data";
import type { AuthVendor } from "../../login-page";

interface VendorReviewsProps {
  vendor: AuthVendor | null;
}

interface Review {
  id: string;
  customer: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  isActive: boolean;
  time: string;
}

export default function VendorReviews({ vendor }: VendorReviewsProps) {
  const url = vendor ? `/api/vendor/reviews?vendorId=${vendor.id}` : null;
  const { data: reviews, loading, forceRefresh } = useFetchOnce<Review[]>(url);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  const list = reviews || [];
  const avgRating = list.length > 0 ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  const total = list.length;

  const sendReply = (reviewId: string) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;
    setSending(reviewId);
    setTimeout(() => {
      setSending(null);
      toast.success("Reply sent", { description: `"${text.slice(0, 60)}${text.length > 60 ? "..." : ""}"` });
      setReplyText((s) => ({ ...s, [reviewId]: "" }));
      forceRefresh();
    }, 600);
  };

  return (
    <div>
      <PageHeader
        title="Reviews"
        description={`${total} reviews · ${avgRating.toFixed(1)} avg rating`}
        actionLabel="Refresh"
        onAction={() => {
          forceRefresh();
          toast.success("Reviews refreshed");
        }}
      />

      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <ContentCard className="p-5">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Average Rating</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#111827]">{avgRating.toFixed(1)}</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
              ))}
            </div>
          </div>
        </ContentCard>
        <ContentCard className="p-5">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Total Reviews</p>
          <p className="mt-2 text-3xl font-bold text-[#111827]">{total}</p>
        </ContentCard>
        <ContentCard className="p-5">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide font-medium">Replied</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {list.filter((r) => r.reply).length}
            <span className="text-base text-[#9CA3AF] font-medium"> / {total}</span>
          </p>
        </ContentCard>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <ContentCard className="p-12 text-center">
          <Star className="w-10 h-10 mx-auto text-[#9CA3AF] mb-3" />
          <p className="text-sm text-[#6B7280]">No reviews yet. Once customers start reviewing, you'll see them here.</p>
        </ContentCard>
      ) : (
        <div className="space-y-4">
          {list.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <ContentCard className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 rounded-full shrink-0">
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-xs rounded-full">
                      {r.customer.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{r.customer}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                          ))}
                          <span className="text-xs text-[#9CA3AF] ml-1">{timeAgo(r.time)}</span>
                        </div>
                      </div>
                      {!r.isActive && <Badge variant="outline" className="text-gray-500 border-gray-200">Hidden</Badge>}
                    </div>
                    <p className="text-sm text-[#4B5563] mt-3">{r.comment || "No comment provided."}</p>

                    {r.reply && (
                      <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-xs font-semibold text-primary mb-1">Your reply</p>
                        <p className="text-sm text-[#111827]">{r.reply}</p>
                      </div>
                    )}

                    {!r.reply && (
                      <div className="mt-3 flex items-end gap-2">
                        <Textarea
                          value={replyText[r.id] || ""}
                          onChange={(e) => setReplyText((s) => ({ ...s, [r.id]: e.target.value }))}
                          placeholder="Write a reply..."
                          className="flex-1 min-h-[60px] max-h-[100px] rounded-lg bg-[#F9FAFB] border-[#E5E7EB] focus-visible:ring-primary text-sm"
                        />
                        <Button
                          onClick={() => sendReply(r.id)}
                          disabled={!replyText[r.id]?.trim() || sending === r.id}
                          size="sm"
                          className="h-9 rounded-lg bg-primary hover:bg-blue-700 text-white shrink-0"
                        >
                          {sending === r.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 mr-1" /> Reply
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </ContentCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
