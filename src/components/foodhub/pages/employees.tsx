"use client";
import PlaceholderPage from "./placeholder-page";
import { UserCog } from "lucide-react";
export default function EmployeesPage() {
  return (
    <PlaceholderPage
      title="Employees"
      description="Manage admin panel employees — create accounts, assign roles, and track activity."
      icon={UserCog}
      features={["Employee List", "Add Employee", "Role Assignment", "Activity Log"]}
      status="active"
    />
  );
}
