"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Row {
  id: string;
  restaurant: string;
  orders: number;
  gross: number;
  commission: number;
  net: number;
  period: string;
}

const DATA: Row[] = [
  { id: "ER-001", restaurant: "Bella Italia", orders: 1248, gross: 24860, commission: 2486, net: 22374, period: "Nov 2025" },
  { id: "ER-002", restaurant: "Sushi Express", orders: 894, gross: 18420, commission: 1842, net: 16578, period: "Nov 2025" },
  { id: "ER-003", restaurant: "Burger Bros", orders: 1102, gross: 17680, commission: 1768, net: 15912, period: "Nov 2025" },
  { id: "ER-004", restaurant: "Tandoori House", orders: 765, gross: 14520, commission: 1452, net: 13068, period: "Nov 2025" },
  { id: "ER-005", restaurant: "Pizza Roma", orders: 421, gross: 8240, commission: 824, net: 7416, period: "Nov 2025" },
  { id: "ER-006", restaurant: "Pho Paradise", orders: 432, gross: 7280, commission: 728, net: 6552, period: "Nov 2025" },
  { id: "ER-007", restaurant: "Taco Loco", orders: 388, gross: 6240, commission: 624, net: 5616, period: "Nov 2025" },
  { id: "ER-008", restaurant: "Green Bowl", orders: 312, gross: 5680, commission: 568, net: 5112, period: "Nov 2025" },
  { id: "ER-009", restaurant: "Dragon Wok", orders: 287, gross: 4920, commission: 492, net: 4428, period: "Nov 2025" },
];

export default function EarningReportsPage() {
  return (
    <ListTable<Row>
      title="Earning Reports"
      description="Per-restaurant earnings & commissions"
      data={DATA}
      searchKeys={["restaurant"]}
      actionLabel="Export CSV"
      onAction={() => toast.success("Exporting CSV...")}
      columns={[
        { key: "id", header: "Report ID" },
        { key: "restaurant", header: "Restaurant", render: (r) => <span className="font-semibold text-[#111827]">{r.restaurant}</span> },
        { key: "orders", header: "Orders", align: "right", render: (r) => <span className="font-medium text-[#111827]">{r.orders}</span> },
        { key: "gross", header: "Gross", align: "right", render: (r) => <span className="text-[#4B5563]">${r.gross.toLocaleString()}</span> },
        { key: "commission", header: "Commission (10%)", align: "right", render: (r) => <span className="text-amber-600">-${r.commission.toLocaleString()}</span> },
        { key: "net", header: "Net Payout", align: "right", render: (r) => <span className="font-bold text-emerald-600">${r.net.toLocaleString()}</span> },
        { key: "period", header: "Period" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.id}`)}
              onEdit={() => toast.info(`Generating PDF for ${r.id}`)}
            />
          ),
        },
      ]}
    />
  );
}
