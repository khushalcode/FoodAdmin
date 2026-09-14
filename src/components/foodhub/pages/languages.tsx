"use client";
import PlaceholderPage from "./placeholder-page";
import { Languages } from "lucide-react";
export default function LanguagesPage() {
  return (
    <PlaceholderPage
      title="Languages"
      description="Manage supported languages and translate UI strings for customers, vendors, and delivery boys."
      icon={Languages}
      features={["English", "Spanish", "Arabic", "French", "Bangla", "Hindi"]}
      status="active"
    />
  );
}
