"use client";
import PlaceholderPage from "./placeholder-page";
import { Plug } from "lucide-react";
export default function ExternalConfigPage() {
  return (
    <PlaceholderPage
      title="External Config"
      description="Configure third-party integrations — Firebase, Google Maps, Twilio, SendGrid, etc."
      icon={Plug}
      features={["Firebase", "Google Maps", "Twilio SMS", "SendGrid Mail", "OAuth Providers"]}
      status="active"
    />
  );
}
