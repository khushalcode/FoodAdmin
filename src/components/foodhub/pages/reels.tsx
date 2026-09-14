"use client";
import PlaceholderPage from "./placeholder-page";
import { Film } from "lucide-react";
export default function ReelsPage() {
  return (
    <PlaceholderPage
      title="Reels Module"
      description="Manage short-form video reels that customers can browse and order from directly."
      icon={Film}
      features={["Reels List", "Add Reel", "Engagement Metrics", "Linked Products"]}
      status="beta"
    />
  );
}
