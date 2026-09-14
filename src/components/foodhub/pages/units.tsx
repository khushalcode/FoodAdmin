"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Unit {
  id: string;
  name: string;
  symbol: string;
  category: string;
  baseUnit: string;
  conversions: number;
  status: string;
}

const DATA: Unit[] = [
  { id: "U-01", name: "Kilogram", symbol: "kg", category: "Weight", baseUnit: "kg", conversions: 5, status: "Active" },
  { id: "U-02", name: "Gram", symbol: "g", category: "Weight", baseUnit: "kg", conversions: 5, status: "Active" },
  { id: "U-03", name: "Pound", symbol: "lb", category: "Weight", baseUnit: "kg", conversions: 3, status: "Active" },
  { id: "U-04", name: "Liter", symbol: "L", category: "Volume", baseUnit: "L", conversions: 4, status: "Active" },
  { id: "U-05", name: "Milliliter", symbol: "mL", category: "Volume", baseUnit: "L", conversions: 4, status: "Active" },
  { id: "U-06", name: "Fluid Ounce", symbol: "fl oz", category: "Volume", baseUnit: "L", conversions: 2, status: "Active" },
  { id: "U-07", name: "Piece", symbol: "pc", category: "Count", baseUnit: "pc", conversions: 0, status: "Active" },
  { id: "U-08", name: "Dozen", symbol: "dz", category: "Count", baseUnit: "pc", conversions: 1, status: "Active" },
  { id: "U-09", name: "Cup", symbol: "cup", category: "Volume", baseUnit: "L", conversions: 3, status: "Active" },
  { id: "U-10", name: "Tablespoon", symbol: "tbsp", category: "Volume", baseUnit: "L", conversions: 3, status: "Inactive" },
];

export default function UnitsPage() {
  return (
    <ListTable<Unit>
      title="Units"
      description="Measurement units used in dishes, inventory and recipes"
      data={DATA}
      searchKeys={["name", "symbol", "category"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Weight", value: "weight", match: (r) => r.category === "Weight" },
        { label: "Volume", value: "volume", match: (r) => r.category === "Volume" },
        { label: "Count", value: "count", match: (r) => r.category === "Count" },
      ]}
      actionLabel="Add Unit"
      onAction={() => toast.success("Opening unit form...")}
      columns={[
        { key: "id", header: "ID" },
        { key: "name", header: "Name", render: (r) => <span className="font-semibold text-[#111827]">{r.name}</span> },
        { key: "symbol", header: "Symbol", render: (r) => <span className="inline-block px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] text-xs font-mono font-medium">{r.symbol}</span> },
        { key: "category", header: "Category" },
        { key: "baseUnit", header: "Base Unit" },
        { key: "conversions", header: "Conversions", align: "right", render: (r) => <span className="font-medium text-[#111827]">{r.conversions}</span> },
        { key: "status", header: "Status" },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          render: (r) => (
            <TableActionButtons
              onView={() => toast.info(`Viewing ${r.name}`)}
              onEdit={() => toast.info(`Editing ${r.name}`)}
              onDelete={() => toast.error(`Deleting ${r.name}`)}
            />
          ),
        },
      ]}
    />
  );
}
