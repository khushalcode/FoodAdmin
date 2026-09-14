"use client";
import PlaceholderPage from "./placeholder-page";
import { Percent } from "lucide-react";
export default function TaxModulePage() {
  return (
    <PlaceholderPage
      title="Tax Module"
      description="Configure tax rates per zone, module, and store. Supports inclusive and exclusive tax types."
      icon={Percent}
      features={["Tax Setup", "Tax Reports", "Per-Store Tax", "Per-Zone Tax", "Tax Types"]}
      status="active"
    />
  );
}
