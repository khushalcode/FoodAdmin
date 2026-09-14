"use client";
import PlaceholderPage from "./placeholder-page";
import { Map } from "lucide-react";
export default function ZonesPage() {
  return (
    <PlaceholderPage
      title="Zones"
      description="Manage service zones — geographic areas where delivery is available. Configure pricing per zone."
      icon={Map}
      features={["Zone List", "Add Zone", "Map Polygon", "Pricing per Zone", "Default Zone"]}
      status="active"
    />
  );
}
