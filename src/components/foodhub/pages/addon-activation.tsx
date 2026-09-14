"use client";
import PlaceholderPage from "./placeholder-page";
import { Key } from "lucide-react";
export default function AddonActivationPage() {
  return (
    <PlaceholderPage
      title="Addon Activation"
      description="Activate purchased addons with license keys. Manage subscriptions and renewals."
      icon={Key}
      features={["License Keys", "Active Subscriptions", "Renewals", "Purchase History"]}
      status="active"
    />
  );
}
