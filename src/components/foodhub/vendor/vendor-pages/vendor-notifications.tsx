"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Bell, CheckCheck, Trash2, Filter } from "lucide-react";
import { PageHeader, ContentCard } from "../../shared/list-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchOnce, timeAgo } from "../use-vendor-data";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  time: string;
}

const TYPE_ICON: Record<string, string> = {
  order: "🛒",
  system: "🔧",
  info: "ℹ️",
  promotion: "🎁",
  payout: "💰",
  review: "⭐",
};

const TYPE_COLOR: Record<string, string> = {
  order: "bg-blue-100",
  system: "bg-gray-100",
  info: "bg-blue-100",
  promotion: "bg-violet-100",
  payout: "bg-amber-100",
  review: "bg-red-100",
};

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Orders", value: "order" },
  { label: "Payouts", value: "payout" },
  { label: "Reviews", value: "review" },
  { label: "Promotions", value: "promotion" },
  { label: "System", value: "system" },
];

export default function VendorNotifications() {
  const { data: notifs, loading, forceRefresh } = useFetchOnce<Notification[]>("/api/notifications?role=vendor");
  const [filter, setFilter] = useState("all");

  const list = notifs || [];
  const filtered = filter === "all" ? list : list.filter((n) => n.type === filter);
  const unread = list.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${unread} unread · ${list.length} total`}
        actionLabel="Mark all read"
        onAction={() => {
          toast.success("All notifications marked as read (demo)");
          forceRefresh();
        }}
      />

      <ContentCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
            <Filter className="w-4 h-4 text-[#9CA3AF] shrink-0 mr-1" />
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`shrink-0 h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-primary text-white"
                    : "bg-[#F3F4F6] text-[#374151] hover:bg-primary hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info("All notifications cleared (demo)")}
            className="text-red-600 hover:bg-red-50 h-8"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear all
          </Button>
        </div>

        {loading ? (
          <div className="p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg mb-2" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 mx-auto text-[#9CA3AF] mb-3" />
            <p className="text-sm text-[#6B7280]">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {filtered.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                className={`flex items-start gap-3 p-4 hover:bg-[#F9FAFB] transition-colors cursor-pointer ${!n.isRead ? "bg-blue-50/30" : ""}`}
              >
                <div className={`relative w-10 h-10 rounded-xl ${TYPE_COLOR[n.type] || "bg-gray-100"} flex items-center justify-center text-lg shrink-0`}>
                  {TYPE_ICON[n.type] || "🔔"}
                  {!n.isRead && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#111827]">{n.title}</p>
                    <span className="text-xs text-[#9CA3AF] shrink-0">{timeAgo(n.time)}</span>
                  </div>
                  <p className="text-sm text-[#4B5563] mt-0.5">{n.body}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {!n.isRead ? (
                      <button
                        onClick={() => toast.info("Marked as read (demo)")}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-[#9CA3AF]">
                        <CheckCheck className="w-3 h-3" /> Read
                      </span>
                    )}
                    <span className="text-[#E5E7EB]">·</span>
                    <button className="text-xs font-medium text-[#6B7280] hover:text-primary">View details</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-[#E5E7EB] text-center">
          <Button variant="ghost" size="sm" className="text-primary hover:bg-blue-50" onClick={() => forceRefresh()}>
            Refresh notifications
          </Button>
        </div>
      </ContentCard>
    </div>
  );
}
