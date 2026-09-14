"use client";
import PlaceholderPage from "./placeholder-page";
import { Hammer } from "lucide-react";
export default function MaintenancePage() {
  return (
    <PlaceholderPage
      title="Maintenance Mode"
      description="Toggle maintenance mode for the customer app and vendor app. Show custom messages during downtime."
      icon={Hammer}
      features={["Toggle Mode", "Maintenance Message", "Scheduled Downtime", "Allowed IPs"]}
      status="active"
    />
  );
}
