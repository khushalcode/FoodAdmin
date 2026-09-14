"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Row {
  id: string;
  period: string;
  grossSales: number;
  taxable: number;
  taxRate: number;
  taxCollected: number;
  status: string;
}

const DATA: Row[] = [
  { id: "TX-2025-11", period: "November 2025", grossSales: 184250, taxable: 162300, taxRate: 8.0, taxCollected: 12984, status: "Filed" },
  { id: "TX-2025-10", period: "October 2025", grossSales: 168400, taxable: 148900, taxRate: 8.0, taxCollected: 11912, status: "Paid" },
  { id: "TX-2025-09", period: "September 2025", grossSales: 152800, taxable: 134600, taxRate: 8.0, taxCollected: 10768, status: "Paid" },
  { id: "TX-2025-08", period: "August 2025", grossSales: 142500, taxable: 124200, taxRate: 8.0, taxCollected: 9936, status: "Paid" },
  { id: "TX-2025-07", period: "July 2025", grossSales: 138900, taxable: 121800, taxRate: 8.0, taxCollected: 9744, status: "Paid" },
  { id: "TX-2025-06", period: "June 2025", grossSales: 128400, taxable: 112100, taxRate: 8.0, taxCollected: 8968, status: "Paid" },
  { id: "TX-2025-05", period: "May 2025", grossSales: 118200, taxable: 103800, taxRate: 8.0, taxCollected: 8304, status: "Paid" },
  { id: "TX-2025-Q3", period: "Q3 2025 (Jul–Sep)", grossSales: 434100, taxable: 381500, taxRate: 8.0, taxCollected: 30520, status: "Filed" },
];

export default function TaxReportsPage() {
  return (
    <ListTable<Row>
      title="Tax Reports"
      description="Sales tax collected per period, ready for filing"
      data={DATA}
      searchKeys={["period"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Filed", value: "filed", match: (r) => r.status === "Filed" },
        { label: "Paid", value: "paid", match: (r) => r.status === "Paid" },
      ]}
      actionLabel="Generate Report"
      onAction={() => toast.success("Generating tax report...")}
      columns={[
        { key: "id", header: "Report ID", render: (r) => <span className="font-mono font-semibold text-primary text-xs">{r.id}</span> },
        { key: "period", header: "Period", render: (r) => <span className="font-semibold text-[#111827]">{r.period}</span> },
        { key: "grossSales", header: "Gross Sales", align: "right", render: (r) => <span className="text-[#4B5563]">${r.grossSales.toLocaleString()}</span> },
        { key: "taxable", header: "Taxable Amount", align: "right", render: (r) => <span className="text-[#4B5563]">${r.taxable.toLocaleString()}</span> },
        { key: "taxRate", header: "Rate", align: "right", render: (r) => <span className="font-medium text-[#111827]">{r.taxRate}%</span> },
        { key: "taxCollected", header: "Tax Collected", align: "right", render: (r) => <span className="font-bold text-amber-600">${r.taxCollected.toLocaleString()}</span> },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.id}`)}
              onEdit={() => toast.info(`Marking ${r.id} as paid`)}
              onDelete={() => toast.error(`Voiding ${r.id}`)}
            />
          ),
        },
      ]}
    />
  );
}
