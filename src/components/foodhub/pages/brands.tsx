"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Brand {
  id: string;
  name: string;
  country: string;
  products: number;
  rating: number;
  status: string;
}

const DATA: Brand[] = [
  { id: "BR-01", name: "Barilla", country: "Italy", products: 42, rating: 4.7, status: "Active" },
  { id: "BR-02", name: "McCormick", country: "USA", products: 38, rating: 4.5, status: "Active" },
  { id: "BR-03", name: "Nestlé Professional", country: "Switzerland", products: 56, rating: 4.6, status: "Active" },
  { id: "BR-04", name: "Heinz", country: "USA", products: 27, rating: 4.4, status: "Active" },
  { id: "BR-05", name: "Kikkoman", country: "Japan", products: 19, rating: 4.8, status: "Active" },
  { id: "BR-06", name: "Lee Kum Kee", country: "Hong Kong", products: 22, rating: 4.6, status: "Active" },
  { id: "BR-07", name: "Goya Foods", country: "USA", products: 31, rating: 4.3, status: "Active" },
  { id: "BR-08", name: "Maggi", country: "Switzerland", products: 24, rating: 4.5, status: "Inactive" },
  { id: "BR-09", name: "Colavita", country: "Italy", products: 14, rating: 4.7, status: "Active" },
  { id: "BR-10", name: "Thai Kitchen", country: "Thailand", products: 16, rating: 4.4, status: "Active" },
];

export default function BrandsPage() {
  return (
    <ListTable<Brand>
      title="Brands"
      description="Food brands available across your restaurants"
      data={DATA}
      searchKeys={["name", "country"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Active", value: "active", match: (r) => r.status === "Active" },
        { label: "Inactive", value: "inactive", match: (r) => r.status === "Inactive" },
      ]}
      actionLabel="Add Brand"
      onAction={() => toast.success("Opening brand form...")}
      columns={[
        { key: "id", header: "ID" },
        { key: "name", header: "Brand", render: (r) => <span className="font-semibold text-[#111827]">{r.name}</span> },
        { key: "country", header: "Country" },
        { key: "products", header: "Products", align: "right", render: (r) => <span className="font-medium text-[#111827]">{r.products}</span> },
        { key: "rating", header: "Rating", align: "right", render: (r) => <span className="inline-flex items-center gap-0.5 text-amber-600"><span className="text-amber-400">★</span>{r.rating}</span> },
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
