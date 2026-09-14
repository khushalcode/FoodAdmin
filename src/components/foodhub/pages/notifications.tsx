"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, Bell, CheckCheck, Trash2, Filter } from "lucide-react";
import { PageHeader, ContentCard, useFakeLoading, ListSkeleton } from "../shared/list-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Notif {
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
  alert: "⚠️",
};

const TYPE_COLOR: Record<string, string> = {
  order: "bg-blue-100",
  system: "bg-gray-100",
  info: "bg-blue-100",
  promotion: "bg-violet-100",
  payout: "bg-amber-100",
  review: "bg-red-100",
  alert: "bg-amber-100",
};

const FALLBACK: Notif[] = [
  { id: "fb-1", title: "New order received", body: "Order #ORD-2841 placed by Olivia Martin ($42.50)", type: "order", isRead: false, time: "1 min ago" },
  { id: "fb-2", title: "Payout request", body: "Bella Italia requested a payout of $1,240.50", type: "payout", isRead: false, time: "20 min ago" },
  { id: "fb-3", title: "New restaurant application", body: "Sushi Express applied for partnership", type: "info", isRead: false, time: "1 hour ago" },
  { id: "fb-4", title: "1-star review alert", body: "Street Tacos received a 1-star review", type: "review", isRead: false, time: "2 hours ago" },
  { id: "fb-5", title: "Low stock alert", body: "Margherita Pizza at Bella Italia is running low", type: "alert", isRead: true, time: "3 hours ago" },
  { id: "fb-6", title: "Daily sales summary", body: "Yesterday's total sales: $4,820.43 (+12.4% WoW)", type: "system", isRead: true, time: "5 hours ago" },
];

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Orders", value: "order" },
  { label: "Payouts", value: "payout" },
  { label: "Reviews", value: "review" },
  { label: "Alerts", value: "alert" },
];

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[] | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const fakeLoading = useFakeLoading(400);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/notifications?role=admin", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const mapped: Notif[] = (json || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          type: n.type,
          isRead: n.isRead,
          time: timeAgo(n.time),
        }));
        setNotifs(mapped);
      } catch (e) {
        if (!cancelled) {
          setNotifs(FALLBACK);
          toast.error("Failed to load notifications — showing sample data");
        }
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = (notifs || FALLBACK).filter((n) => filter === "all" || n.type === filter);
  const unread = (notifs || FALLBACK).filter((n) => !n.isRead).length;

  if (apiLoading || fakeLoading) {
    return (
      <div>
        <PageHeader title="Notifications" description="Loading notifications..." actionLabel="Mark all read" />
        <ContentCard className="overflow-hidden">
          <div className="p-5">
            <ListSkeleton rows={6} />
          </div>
        </ContentCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${unread} unread notifications · ${notifs?.length || 0} total`}
        actionLabel="Mark all read"
        onAction={() => toast.success("All notifications marked as read")}
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
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 h-8">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear all
          </Button>
        </div>

        {list.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 mx-auto text-[#9CA3AF] mb-3" />
            <p className="text-sm text-[#6B7280]">No notifications in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {list.map((n, i) => (
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
                    <span className="text-xs text-[#9CA3AF] shrink-0">{n.time}</span>
                  </div>
                  <p className="text-sm text-[#4B5563] mt-0.5">{n.body}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {!n.isRead ? (
                      <button onClick={() => toast.info("Marked as read")} className="text-xs font-medium text-primary hover:underline">
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
          <Button variant="ghost" size="sm" className="text-primary hover:bg-blue-50">
            Load more notifications
          </Button>
        </div>
      </ContentCard>
    </div>
  );
}
