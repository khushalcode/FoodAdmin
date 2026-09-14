"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Attribute {
  id: string;
  name: string;
  type: string;
  values: string;
  used: number;
  status: string;
}

const DATA: Attribute[] = [
  { id: "AT-01", name: "Size", type: "Dropdown", values: "Small, Medium, Large, XL", used: 42, status: "Active" },
  { id: "AT-02", name: "Spice Level", type: "Dropdown", values: "Mild, Medium, Hot, Extra Hot", used: 28, status: "Active" },
  { id: "AT-03", name: "Crust Type", type: "Dropdown", values: "Thin, Regular, Stuffed, Gluten-Free", used: 14, status: "Active" },
  { id: "AT-04", name: "Toppings", type: "Multi-select", values: "Cheese, Olives, Mushrooms, Peppers", used: 56, status: "Active" },
  { id: "AT-05", name: "Sauce", type: "Dropdown", values: "Tomato, BBQ, Alfredo, Pesto", used: 33, status: "Active" },
  { id: "AT-06", name: "Cooking Style", type: "Dropdown", values: "Rare, Medium, Well-done", used: 19, status: "Active" },
  { id: "AT-07", name: "Drink Pairing", type: "Multi-select", values: "Cola, Lemonade, Water, Beer", used: 24, status: "Active" },
  { id: "AT-08", name: "Extra Cheese", type: "Checkbox", values: "Yes / No", used: 78, status: "Active" },
  { id: "AT-09", name: "Allergen Info", type: "Multi-select", values: "Gluten, Dairy, Nuts, Soy", used: 41, status: "Active" },
  { id: "AT-10", name: "Packaging", type: "Dropdown", values: "Standard, Gift Box, Eco", used: 12, status: "Inactive" },
];

export default function AttributesPage() {
  return (
    <ListTable<Attribute>
      title="Attributes"
      description="Define customization attributes for dishes (size, toppings, etc.)"
      data={DATA}
      searchKeys={["name", "type"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Active", value: "active", match: (r) => r.status === "Active" },
        { label: "Inactive", value: "inactive", match: (r) => r.status === "Inactive" },
      ]}
      actionLabel="Add Attribute"
      onAction={() => toast.success("Opening attribute form...")}
      columns={[
        { key: "id", header: "Code" },
        { key: "name", header: "Name", render: (r) => <span className="font-semibold text-[#111827]">{r.name}</span> },
        { key: "type", header: "Type", render: (r) => <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-primary text-xs font-medium">{r.type}</span> },
        { key: "values", header: "Values", render: (r) => <span className="text-[#4B5563] truncate block max-w-xs">{r.values}</span> },
        { key: "used", header: "Used By", align: "right", render: (r) => <span className="font-medium text-[#111827]">{r.used} dishes</span> },
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
