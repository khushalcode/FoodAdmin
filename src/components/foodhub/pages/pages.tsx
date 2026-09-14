"use client";
import PlaceholderPage from "./placeholder-page";
import { FileText } from "lucide-react";
export default function PagesPage() {
  return (
    <PlaceholderPage
      title="Pages Setup"
      description="Manage static pages — About Us, Terms, Privacy Policy, Refund Policy, Contact, FAQs."
      icon={FileText}
      features={["About Us", "Terms & Conditions", "Privacy Policy", "Refund Policy", "FAQ", "Contact"]}
      status="active"
    />
  );
}
