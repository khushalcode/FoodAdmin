"use client";
import PlaceholderPage from "./placeholder-page";
import { Puzzle } from "lucide-react";
export default function AddonsPage() {
  return (
    <PlaceholderPage
      title="Addons"
      description="Browse and install official FoodHub addons — additional features and integrations."
      icon={Puzzle}
      features={["Installed Addons", "Addon Store", "Categories", "Updates"]}
      status="active"
    />
  );
}
