"use client";

import { useState } from "react";
import LoginPage, { type AuthUser, type AuthVendor } from "@/components/foodhub/login-page";
import Dashboard from "@/components/foodhub/dashboard";
import VendorDashboard from "@/components/foodhub/vendor/vendor-dashboard";
import { ChefHat, Bike, Sparkles } from "lucide-react";

interface PlaceholderProps {
  user: AuthUser;
  role: "customer" | "delivery";
  onLogout: () => void;
}

const ROLE_PLACEHOLDER: Record<
  "customer" | "delivery",
  { title: string; subtitle: string; icon: typeof Sparkles; gradient: string }
> = {
  customer: {
    title: "Customer Dashboard",
    subtitle: "Order your favorite food from anywhere, track deliveries, and manage your wallet.",
    icon: Sparkles,
    gradient: "from-blue-500 to-indigo-600",
  },
  delivery: {
    title: "Delivery Boy Dashboard",
    subtitle: "Accept new orders, navigate deliveries, and track your earnings in real time.",
    icon: Bike,
    gradient: "from-emerald-500 to-teal-600",
  },
};

function ComingSoonCard({ user, role, onLogout }: PlaceholderProps) {
  const cfg = ROLE_PLACEHOLDER[role];
  const Icon = cfg.icon;
  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-[#E5E7EB] p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-sm">
            <ChefHat className="w-7 h-7" />
          </div>
        </div>
        <div className={`w-20 h-20 rounded-3xl mx-auto mb-5 bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white shadow-md`}>
          <Icon className="w-10 h-10" strokeWidth={1.8} />
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">{cfg.title}</h1>
        <p className="text-sm text-[#6B7280] mt-2 mb-1">
          Welcome back, <span className="font-semibold text-[#111827]">{user.name}</span>!
        </p>
        <p className="text-sm text-[#6B7280] mb-6">{cfg.subtitle}</p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          Coming soon — stay tuned!
        </span>
        <button
          onClick={onLogout}
          className="mt-6 w-full h-11 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow-md"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [vendor, setVendor] = useState<AuthVendor | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    setAuthed(false);
    setUser(null);
    setVendor(null);
    setActiveTab("dashboard");
  };

  if (!authed || !user) {
    return (
      <LoginPage
        onLogin={(u, v) => {
          setUser(u);
          setVendor(v);
          setAuthed(true);
          setActiveTab("dashboard");
        }}
      />
    );
  }

  if (user.role === "admin") {
    return (
      <Dashboard
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
    );
  }

  if (user.role === "vendor") {
    return (
      <VendorDashboard
        user={user}
        vendor={vendor}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
    );
  }

  if (user.role === "customer" || user.role === "delivery") {
    return (
      <ComingSoonCard
        user={user}
        role={user.role as "customer" | "delivery"}
        onLogout={handleLogout}
      />
    );
  }

  // Fallback: unknown role
  return (
    <LoginPage
      onLogin={(u, v) => {
        setUser(u);
        setVendor(v);
        setAuthed(true);
        setActiveTab("dashboard");
      }}
    />
  );
}
