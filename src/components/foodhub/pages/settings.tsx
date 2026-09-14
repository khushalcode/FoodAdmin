"use client";
import PlaceholderPage from "./placeholder-page";
import { Sliders } from "lucide-react";
export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="System Settings"
      description="Configure global system settings — currency, language, timezone, mail, SMS, and push notifications."
      icon={Sliders}
      features={["General", "Currency & Tax", "Mail Config", "SMS Config", "Push Notifications", "Webhooks"]}
      status="active"
    />
  );
}
