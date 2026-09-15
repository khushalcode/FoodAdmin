"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, X, Building2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { PageHeader, ContentCard, GridSkeleton } from "../shared/list-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  applicationStatus: string; // pending | approved | rejected | suspended
  status: string; // pending | approved | rejected | suspended
  logo: string | null;
  createdAt: string;
}

const FALLBACK: Application[] = [
  {
    id: "fb-1",
    name: "Burger Kingdom",
    email: "james@burgerkingdom.com",
    phone: "+1 555 0142",
    address: "12 Main St, New York, NY",
    applicationStatus: "pending",
    status: "pending",
    logo: null,
    createdAt: "2025-11-19T10:00:00Z",
  },
  {
    id: "fb-2",
    name: "Sakura Ramen",
    email: "hana@sakuraramen.jp",
    phone: "+81 90 1234 5678",
    address: "1-2-3 Shibuya, Tokyo",
    applicationStatus: "pending",
    status: "pending",
    logo: null,
    createdAt: "2025-11-18T10:00:00Z",
  },
  {
    id: "fb-3",
    name: "Spice Route",
    email: "priya@spiceroute.in",
    phone: "+91 98765 43210",
    address: "23 MG Road, Mumbai",
    applicationStatus: "pending",
    status: "pending",
    logo: null,
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "fb-4",
    name: "La Petite Boulangerie",
    email: "camille@petiteboulangerie.fr",
    phone: "+33 6 12 34 56 78",
    address: "8 Rue du Pain, Paris",
    applicationStatus: "pending",
    status: "pending",
    logo: null,
    createdAt: "2025-11-12T10:00:00Z",
  },
  {
    id: "fb-5",
    name: "Taco Fiesta",
    email: "diego@tacofiesta.mx",
    phone: "+52 55 1234 5678",
    address: "Av. Reforma 50, Mexico City",
    applicationStatus: "pending",
    status: "pending",
    logo: null,
    createdAt: "2025-11-08T10:00:00Z",
  },
];

const STATUS_CLS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  suspended: "bg-gray-100 text-gray-600 border-gray-200",
};

const GRADIENTS = [
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-orange-500 to-red-600",
  "from-violet-500 to-purple-600",
  "from-lime-500 to-green-600",
  "from-emerald-500 to-teal-600",
];

function timeAgo(s: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (24 * 3600 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
}

export default function RestaurantApplicationsPage() {
  const [items, setItems] = useState<Application[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [busy, setBusy] = useState<string | null>(null);

  // Fetch helper — accepts ?status=pending|approved|rejected|suspended|all
  const refetch = async (status: string = filter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurant-applications?status=${status}`, { cache: "no-store" });
      const json = await res.json();
      const arr: Application[] = Array.isArray(json) ? json : json.items ?? [];
      setItems(arr.length > 0 ? arr : FALLBACK);
    } catch {
      setItems(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + refetch on filter change
  useEffect(() => {
    refetch(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleFilterChange = (v: string) => {
    setFilter(v);
  };

  const decide = async (a: Application, decision: "approved" | "rejected") => {
    setBusy(a.id);
    try {
      const res = await fetch("/api/restaurant-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: a.id,
          applicationStatus: decision,
          status: decision,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      toast.success(`${a.name} ${decision === "approved" ? "approved" : "rejected"}`);
      // Optimistic local update
      setItems((cur) =>
        cur.map((x) =>
          x.id === a.id ? { ...x, applicationStatus: decision, status: decision } : x,
        ),
      );
      // If we're filtering by pending, refetch to drop this row
      if (filter !== "all") refetch(filter);
    } catch (e: any) {
      toast.error(`Failed to ${decision} ${a.name}: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Restaurant Applications"
        description="Pending partnership applications from restaurants"
        actionLabel="Refresh"
        onAction={() => refetch()}
      />

      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto">
        {[
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Suspended", value: "suspended" },
          { label: "All", value: "all" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`shrink-0 h-9 px-3.5 rounded-lg text-xs font-medium border transition-colors ${
              filter === f.value
                ? "bg-primary text-white border-primary"
                : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F9FAFB]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : items.length === 0 ? (
        <ContentCard className="p-12 text-center text-sm text-muted-foreground">
          No {filter !== "all" ? filter : ""} applications.
        </ContentCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((a, i) => {
            const status = (a.applicationStatus || a.status || "pending").toLowerCase();
            const cls = STATUS_CLS[status] || STATUS_CLS.pending;
            const showActions = status === "pending";
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ContentCard className="p-5 h-full">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12 rounded-xl shrink-0">
                      <AvatarFallback
                        className={`bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} text-white rounded-xl font-bold`}
                      >
                        {a.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.logo} alt={a.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Building2 className="w-5 h-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground">{a.name}</h3>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${cls}`}
                      >
                        {status} · applied {timeAgo(a.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      <span className="truncate">{a.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      <span>{a.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      <span className="truncate">{a.address || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      <span>{timeAgo(a.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-[#F3F4F6]">
                    {showActions ? (
                      <>
                        <Button
                          onClick={() => decide(a, "approved")}
                          disabled={busy === a.id}
                          className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                        >
                          <Check className="w-4 h-4 mr-1.5" /> Approve
                        </Button>
                        <Button
                          onClick={() => decide(a, "rejected")}
                          disabled={busy === a.id}
                          variant="outline"
                          className="flex-1 h-9 rounded-lg border-[#E5E7EB] text-red-600 hover:bg-red-50 text-xs font-semibold"
                        >
                          <X className="w-4 h-4 mr-1.5" /> Reject
                        </Button>
                      </>
                    ) : (
                      <div className="flex-1 text-center text-xs text-muted-foreground py-1.5">
                        Decision already submitted · status:{" "}
                        <span className="font-medium capitalize">{status}</span>
                      </div>
                    )}
                  </div>
                </ContentCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
