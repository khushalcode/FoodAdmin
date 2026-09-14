"use client";
import PlaceholderPage from "./placeholder-page";
import { ShoppingBag } from "lucide-react";
export default function ParcelOrdersPage() {
  return (
    <PlaceholderPage
      title="Parcel Orders"
      description="View and manage all parcel delivery orders — pickup, transit, delivered."
      icon={ShoppingBag}
      features={["Active Orders", "History", "Tracking", "Cancellation Reasons"]}
      status="active"
    />
  );
}
