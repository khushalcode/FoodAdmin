"use client";

import { toast } from "sonner";
import { CrudListTable, type Column } from "../shared/crud-list-table";
import { TableActionButtons } from "../shared/list-page";
import { useCrud } from "@/hooks/use-crud";

type PromotionType = "banner" | "coupon" | "campaign" | "flash_sale";

interface Promotion {
  id: string;
  name: string;
  title: string;
  type: PromotionType;
  status: string;
  startDate: string;
  endDate: string;
  discount?: string;
}

const FALLBACK: Promotion[] = [
  { id: "B-01", name: "Hero Banner — Pizza Fest", title: "Summer Pizza Fest", type: "banner", status: "Published", startDate: "2025-06-01", endDate: "2025-08-31" },
  { id: "CP-01", name: "WELCOME10", title: "10% off first order", type: "coupon", status: "Active", startDate: "2025-01-01", endDate: "2025-12-31", discount: "10%" },
  { id: "CM-01", name: "Summer Pizza Fest", title: "Email + Social campaign", type: "campaign", status: "Running", startDate: "2025-06-01", endDate: "2025-08-31" },
  { id: "FS-01", name: "Flash Sale — Burgers", title: "50% off burgers 12-2PM", type: "flash_sale", status: "Scheduled", startDate: "2025-11-20", endDate: "2025-11-20", discount: "50%" },
  { id: "B-02", name: "Ramadan Iftar Banner", title: "Iftar deals every day", type: "banner", status: "Published", startDate: "2025-03-01", endDate: "2025-04-15" },
  { id: "FS-02", name: "Midnight Munchies", title: "10% off 12AM-4AM", type: "flash_sale", status: "Active", startDate: "2025-01-01", endDate: "2025-12-31", discount: "10%" },
];

const TYPE_BADGE: Record<PromotionType, string> = {
  banner: "bg-blue-50 text-primary border-blue-200",
  coupon: "bg-emerald-50 text-emerald-700 border-emerald-200",
  campaign: "bg-violet-50 text-violet-700 border-violet-200",
  flash_sale: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_COLORS: Record<string, string> = {
  Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Running: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Scheduled: "bg-blue-50 text-primary border-blue-200",
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Expired: "bg-red-50 text-red-700 border-red-200",
};

export default function PromotionsPage() {
  const { items, loading, refetch } = useCrud<Promotion>({
    endpoint: "/api/promotions",
    mapRow: (r) => ({
      id: String(r.id),
      name: r.name ?? r.code ?? "",
      title: r.title ?? r.description ?? "",
      type: (r.type ?? "coupon") as PromotionType,
      status: r.status ?? "Active",
      startDate: r.startDate ?? r.start_date ?? "",
      endDate: r.endDate ?? r.end_date ?? "",
      discount: r.discount ?? r.value,
    }),
    itemName: "Promotion",
    fallback: FALLBACK,
  });

  const columns: Column<Promotion>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-semibold text-[#111827]">{r.name}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${TYPE_BADGE[r.type]}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {r.type === "flash_sale" ? "Flash Sale" : r.type.charAt(0).toUpperCase() + r.type.slice(1)}
        </span>
      ),
    },
    {
      key: "title",
      header: "Description",
      render: (r) => <span className="text-[#4B5563] text-sm">{r.title || "—"}</span>,
    },
    {
      key: "discount",
      header: "Value",
      align: "right",
      render: (r) =>
        r.discount ? <span className="font-semibold text-emerald-600">{r.discount}</span> : <span className="text-[#9CA3AF]">—</span>,
    },
    { key: "startDate", header: "Start" },
    { key: "endDate", header: "End" },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const cls = STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600 border-gray-200";
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${cls}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {r.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <TableActionButtons
          onView={() =>
            toast.info(
              `Viewing ${r.type === "flash_sale" ? "Flash Sale" : r.type.charAt(0).toUpperCase() + r.type.slice(1)}: ${r.name}`,
            )
          }
        />
      ),
    },
  ];

  return (
    <CrudListTable<Promotion>
      title="Promotions"
      description="Unified list of banners, coupons, campaigns & flash sales"
      items={items}
      loading={loading}
      columns={columns}
      searchKeys={["name", "title"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Banners", value: "banner", match: (r) => r.type === "banner" },
        { label: "Coupons", value: "coupon", match: (r) => r.type === "coupon" },
        { label: "Campaigns", value: "campaign", match: (r) => r.type === "campaign" },
        { label: "Flash Sales", value: "flash_sale", match: (r) => r.type === "flash_sale" },
      ]}
      onRefresh={refetch}
      emptyMessage="No promotions found."
    />
  );
}
