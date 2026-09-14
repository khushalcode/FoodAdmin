"use client";
import PlaceholderPage from "./placeholder-page";
import { Puzzle } from "lucide-react";
export default function ModulesPage() {
  return (
    <PlaceholderPage
      title="Modules"
      description="Manage all available business verticals — Food, Grocery, Pharmacy, Shop, Parcel, Rental, Ride Share, and Service modules."
      icon={Puzzle}
      features={["Food Module", "Grocery Module", "Pharmacy Module", "Shop Module", "Parcel Module", "Rental Module"]}
      status="active"
    />
  );
}
