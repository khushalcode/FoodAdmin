"use client";
import PlaceholderPage from "./placeholder-page";
import { Car } from "lucide-react";
export default function RideSharePage() {
  return (
    <PlaceholderPage
      title="Ride Share"
      description="Configure ride-share vehicles, pricing per km, surge pricing, and rider assignments."
      icon={Car}
      features={["Vehicle Types", "Pricing Setup", "Surge Pricing", "Rider List", "Trip History"]}
      status="beta"
    />
  );
}
