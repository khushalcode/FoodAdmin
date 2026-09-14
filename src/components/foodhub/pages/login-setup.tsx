"use client";
import PlaceholderPage from "./placeholder-page";
import { LogIn } from "lucide-react";
export default function LoginSetupPage() {
  return (
    <PlaceholderPage
      title="Login Setup"
      description="Configure login methods — email/password, Google, Facebook, Apple, phone OTP."
      icon={LogIn}
      features={["Email Login", "Social Login", "Phone OTP", "Guest Checkout"]}
      status="active"
    />
  );
}
