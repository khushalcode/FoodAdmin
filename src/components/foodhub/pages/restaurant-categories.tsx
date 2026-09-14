"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";

interface Category {
  id: string;
  name: string;
  slug: string;
  restaurants: number;
  featured: boolean;
  status: string;
  emoji: string;
}

const DATA: Category[] = [
  { id: "RC-01", name: "Fast Food", slug: "fast-food", restaurants: 24, featured: true, status: "Active", emoji: "🍔" },
  { id: "RC-02", name: "Fine Dining", slug: "fine-dining", restaurants: 12, featured: true, status: "Active", emoji: "🍷" },
  { id: "RC-03", name: "Cafe", slug: "cafe", restaurants: 38, featured: false, status: "Active", emoji: "☕" },
  { id: "RC-04", name: "Desserts", slug: "desserts", restaurants: 19, featured: true, status: "Active", emoji: "🍰" },
  { id: "RC-05", name: "Healthy", slug: "healthy", restaurants: 22, featured: false, status: "Active", emoji: "🥗" },
  { id: "RC-06", name: "Bakery", slug: "bakery", restaurants: 14, featured: false, status: "Active", emoji: "🥖" },
  { id: "RC-07", name: "Street Food", slug: "street-food", restaurants: 31, featured: true, status: "Active", emoji: "🌮" },
  { id: "RC-08", name: "Vegan", slug: "vegan", restaurants: 9, featured: false, status: "Inactive", emoji: "🌱" },
  { id: "RC-09", name: "Seafood", slug: "seafood", restaurants: 7, featured: false, status: "Active", emoji: "🦐" },
  { id: "RC-10", name: "BBQ & Grill", slug: "bbq-grill", restaurants: 11, featured: false, status: "Active", emoji: "🍖" },
];

export default function RestaurantCategoriesPage() {
  return (
    <ListTable<Category>
      title="Restaurant Categories"
      description="Categorize restaurants by cuisine & style"
      data={DATA}
      searchKeys={["name", "slug"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Featured", value: "featured", match: (r) => r.featured },
        { label: "Active", value: "active", match: (r) => r.status === "Active" },
        { label: "Inactive", value: "inactive", match: (r) => r.status === "Inactive" },
      ]}
      actionLabel="Add Category"
      onAction={() => toast.success("Opening category form...")}
      columns={[
        { key: "name", header: "Category", render: (r) => (
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-lg">{r.emoji}</span>
            <span className="font-semibold text-[#111827]">{r.name}</span>
          </div>
        ) },
        { key: "slug", header: "Slug", render: (r) => <span className="font-mono text-xs text-[#6B7280]">/{r.slug}</span> },
        { key: "restaurants", header: "Restaurants", align: "right", render: (r) => <span className="font-medium text-[#111827]">{r.restaurants}</span> },
        { key: "featured", header: "Featured", render: (r) => r.featured ? <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">★ Featured</span> : <span className="text-[#9CA3AF] text-xs">—</span> },
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
