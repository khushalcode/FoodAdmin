"use client";

import { toast } from "sonner";
import { ListTable, TableActionButtons } from "../shared/list-table";
import { Progress } from "@/components/ui/progress";

interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  spent: number;
  conversions: number;
  startDate: string;
  status: string;
}

const DATA: Campaign[] = [
  { id: "C-01", name: "Summer Pizza Fest", channel: "Email + Social", budget: 5000, spent: 3240, conversions: 412, startDate: "2025-06-01", status: "Running" },
  { id: "C-02", name: "Burger Combo Launch", channel: "Push Notification", budget: 2500, spent: 2150, conversions: 318, startDate: "2025-07-15", status: "Running" },
  { id: "C-03", name: "Healthy January", channel: "Social Media", budget: 3000, spent: 890, conversions: 124, startDate: "2025-08-10", status: "Scheduled" },
  { id: "C-04", name: "Sushi Lover Promo", channel: "Email", budget: 1500, spent: 1500, conversions: 267, startDate: "2025-05-01", status: "Completed" },
  { id: "C-05", name: "Ramadan Iftar Special", channel: "Multi-channel", budget: 8000, spent: 7650, conversions: 921, startDate: "2025-03-01", status: "Completed" },
  { id: "C-06", name: "Diwali Sweets", channel: "SMS + Email", budget: 4000, spent: 980, conversions: 0, startDate: "2025-11-12", status: "Draft" },
  { id: "C-07", name: "Weekend Family Combo", channel: "Push Notification", budget: 2000, spent: 1240, conversions: 189, startDate: "2025-09-05", status: "Running" },
  { id: "C-08", name: "New User Welcome", channel: "Email", budget: 1200, spent: 1120, conversions: 156, startDate: "2025-04-22", status: "Completed" },
];

export default function CampaignsPage() {
  return (
    <ListTable<Campaign>
      title="Campaigns"
      description="Marketing campaigns across email, social, SMS and push"
      data={DATA}
      searchKeys={["name", "channel"]}
      statusKey="status"
      filters={[
        { label: "All", value: "all", match: () => true },
        { label: "Running", value: "running", match: (r) => r.status === "Running" },
        { label: "Scheduled", value: "scheduled", match: (r) => r.status === "Scheduled" },
        { label: "Completed", value: "completed", match: (r) => r.status === "Completed" },
        { label: "Draft", value: "draft", match: (r) => r.status === "Draft" },
      ]}
      actionLabel="New Campaign"
      onAction={() => toast.success("Opening campaign builder...")}
      columns={[
        { key: "id", header: "ID" },
        { key: "name", header: "Campaign", render: (r) => <span className="font-semibold text-[#111827]">{r.name}</span> },
        { key: "channel", header: "Channel", render: (r) => <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-xs font-medium">{r.channel}</span> },
        {
          key: "spent",
          header: "Budget Used",
          render: (r) => {
            const pct = Math.round((r.spent / r.budget) * 100);
            return (
              <div className="w-32">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#6B7280]">${r.spent.toLocaleString()}</span>
                  <span className="font-medium text-[#111827]">${r.budget.toLocaleString()}</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          },
        },
        { key: "conversions", header: "Conversions", align: "right", render: (r) => <span className="font-semibold text-emerald-600">{r.conversions}</span> },
        { key: "startDate", header: "Start Date" },
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
