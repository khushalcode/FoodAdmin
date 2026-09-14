"use client";
import PlaceholderPage from "./placeholder-page";
import { Folder } from "lucide-react";
export default function ParcelCategoriesPage() {
  return (
    <PlaceholderPage
      title="Parcel Categories"
      description="Manage parcel categories for the parcel delivery module — documents, electronics, fragile items, etc."
      icon={Folder}
      features={["Categories", "Pricing per Category", "Size Limits"]}
      status="active"
    />
  );
}
