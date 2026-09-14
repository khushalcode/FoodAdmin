"use client";
import PlaceholderPage from "./placeholder-page";
import { Truck } from "lucide-react";
export default function ParcelDispatchPage() {
  return (
    <PlaceholderPage
      title="Parcel Dispatch"
      description="Assign parcel orders to delivery riders, track dispatch status, and view live ETA."
      icon={Truck}
      features={["Dispatch Queue", "Rider Assignment", "Live Tracking", "Returns"]}
      status="active"
    />
  );
}
