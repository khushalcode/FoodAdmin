"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface SubCategory {
  id: string;
  name: string;
  parent: string;
  items: number;
  status: string;
  updated: string;
}

const DATA: SubCategory[] = [
  { id: "sc-01", name: "Margherita Pizzas", parent: "Pizza", items: 18, status: "Active", updated: "2025-11-14" },
  { id: "sc-02", name: "Pepperoni Pizzas", parent: "Pizza", items: 12, status: "Active", updated: "2025-11-13" },
  { id: "sc-03", name: "Veggie Pizzas", parent: "Pizza", items: 9, status: "Active", updated: "2025-11-12" },
  { id: "sc-04", name: "Beef Burgers", parent: "Burgers", items: 22, status: "Active", updated: "2025-11-15" },
  { id: "sc-05", name: "Chicken Burgers", parent: "Burgers", items: 16, status: "Active", updated: "2025-11-11" },
  { id: "sc-06", name: "Veggie Burgers", parent: "Burgers", items: 7, status: "Inactive", updated: "2025-11-09" },
  { id: "sc-07", name: "Maki Rolls", parent: "Sushi", items: 24, status: "Active", updated: "2025-11-14" },
  { id: "sc-08", name: "Nigiri", parent: "Sushi", items: 11, status: "Active", updated: "2025-11-13" },
  { id: "sc-09", name: "Sashimi", parent: "Sushi", items: 8, status: "Active", updated: "2025-11-12" },
  { id: "sc-10", name: "Caesar Salads", parent: "Salads", items: 14, status: "Active", updated: "2025-11-15" },
  { id: "sc-11", name: "Garden Salads", parent: "Salads", items: 9, status: "Active", updated: "2025-11-14" },
  { id: "sc-12", name: "Hot Soups", parent: "Soups", items: 11, status: "Active", updated: "2025-11-13" },
];

export default function SubCategoriesPage() {
  return (
    <ListTable<SubCategory>
      title="Sub Categories"
      description="Group dishes into sub-categories for finer navigation"
      data={DATA}
      searchKeys={["name", "parent"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Active", value: "active", match: (r) => r.status === "Active" },
        { label: "Inactive", value: "inactive", match: (r) => r.status === "Inactive" },
      ]}
      actionLabel="Add Sub Category"
      onAction={() => toast.success("Opening sub-category form...")}
      columns={[
        { key: "id", header: "ID" },
        { key: "name", header: "Name" },
        { key: "parent", header: "Parent Category" },
        { key: "items", header: "Items", align: "right", render: (r) => <span className="font-medium text-[#111827]">{r.items}</span> },
        { key: "status", header: "Status" },
        { key: "updated", header: "Last Updated" },
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
