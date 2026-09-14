"use client";
import PlaceholderPage from "./placeholder-page";
import { Package } from "lucide-react";
export default function RentalPage() {
  return (
    <PlaceholderPage
      title="Rental Module"
      description="Manage rental inventory, pricing per day/hour, and booking schedules."
      icon={Package}
      features={["Rental Items", "Bookings", "Pricing", "Availability Calendar"]}
      status="beta"
    />
  );
}
