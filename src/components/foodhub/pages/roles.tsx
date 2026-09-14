"use client";
import PlaceholderPage from "./placeholder-page";
import { ShieldCheck } from "lucide-react";
export default function RolesPage() {
  return (
    <PlaceholderPage
      title="Roles & Permissions"
      description="Create custom roles for admins and employees with fine-grained permission control."
      icon={ShieldCheck}
      features={["Super Admin", "Admin", "Manager", "Editor", "Viewer", "Add New Role"]}
      status="active"
    />
  );
}
