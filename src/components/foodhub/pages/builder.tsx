"use client";
import PlaceholderPage from "./placeholder-page";
import { Wrench } from "lucide-react";
export default function BuilderPage() {
  return (
    <PlaceholderPage
      title="Page Builder"
      description="Build custom landing pages, banners, and UI sections with a drag-and-drop builder."
      icon={Wrench}
      features={["Page Templates", "Drag & Drop Builder", "Sections", "SEO Settings"]}
      status="beta"
    />
  );
}
