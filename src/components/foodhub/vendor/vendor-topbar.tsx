"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  Plus,
  Calendar,
  ChevronDown,
  Moon,
  Sun,
  Settings,
  Star,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { AuthUser, AuthVendor } from "../login-page";

interface VendorTopbarProps {
  user: AuthUser;
  vendor: AuthVendor | null;
  title: string;
  subtitle?: string;
  onOpenMobileSidebar: () => void;
  lastUpdated?: string;
  onLogout?: () => void;
}

export default function VendorTopbar({
  user,
  vendor,
  title,
  subtitle,
  onOpenMobileSidebar,
  lastUpdated,
  onLogout,
}: VendorTopbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const displayName = user.name;
  const displayEmail = user.email;
  const initials = displayName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const fullTitle = vendor ? `${vendor.storeName} · ${title}` : title;

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] flex items-center gap-3 px-4 sm:px-6">
      {/* Mobile menu btn */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={onOpenMobileSidebar}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Title */}
      <div className="min-w-0 shrink">
        <h1 className="text-lg sm:text-xl font-bold text-[#111827] truncate leading-tight">{fullTitle}</h1>
        {subtitle && <p className="text-xs text-[#6B7280] truncate hidden sm:block">{subtitle}</p>}
      </div>

      {/* Vendor quick stats pills */}
      {vendor && (
        <div className="ml-auto hidden md:flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            {vendor.rating.toFixed(1)}
          </div>
          <div className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
            <Wallet className="w-3.5 h-3.5" />
            ${vendor.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="ml-auto md:ml-2 hidden lg:flex relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="search"
          placeholder="Search orders, products..."
          className="w-56 lg:w-72 h-10 pl-9 pr-3 rounded-lg bg-[#F3F4F6] border border-transparent text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Date range pill */}
      <button className="hidden xl:inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-[#E5E7EB] text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
        <Calendar className="w-4 h-4 text-[#6B7280]" />
        <span className="font-medium">Last 7 days</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
      </button>

      {/* Action buttons */}
      <Button
        size="sm"
        onClick={() => toast.success("Opening new product form...")}
        className="hidden sm:inline-flex h-10 px-3.5 rounded-lg bg-primary hover:bg-blue-700 text-white shadow-sm"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Add Product
      </Button>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
        onClick={() => {
          const next = theme === "light" ? "dark" : "light";
          setTheme(next);
          toast.info(`Theme: ${next} mode (demo)`);
        }}
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </Button>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative shrink-0 w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 rounded-xl p-0">
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <p className="font-semibold text-[#111827]">Notifications</p>
            <p className="text-xs text-[#6B7280]">Recent activity in your store</p>
          </div>
          <div className="max-h-72 overflow-y-auto scrollbar-thin">
            {[
              { title: "New order received", desc: "Order #ORD-2841 placed just now", time: "1m ago", color: "bg-blue-500" },
              { title: "New review", desc: "A customer rated your store 5 stars", time: "20m ago", color: "bg-amber-500" },
              { title: "Payout processed", desc: "$1,240 paid out to your bank", time: "1h ago", color: "bg-emerald-500" },
            ].map((n, i) => (
              <DropdownMenuItem key={i} className="px-4 py-3 cursor-pointer hover:bg-[#F9FAFB]">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${n.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#111827]">{n.title}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{n.desc}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">{n.time}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="px-4 py-2.5 cursor-pointer justify-center text-primary text-sm font-medium">
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 pl-1 pr-2 sm:pr-3 py-1 rounded-full hover:bg-[#F3F4F6] transition-colors shrink-0">
            <Avatar className="w-8 h-8 rounded-full">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-full">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-sm font-semibold text-[#111827]">{displayName}</span>
              <span className="text-[10px] text-[#6B7280]">Vendor</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] hidden sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl">
          <DropdownMenuLabel className="px-3 py-2">
            <p className="text-sm font-semibold text-[#111827]">{displayName}</p>
            <p className="text-xs text-[#6B7280]">{displayEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">My Profile</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Store Settings</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
            onClick={() => {
              if (onLogout) onLogout();
              else toast.info("Signed out (demo)");
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Live updated indicator */}
      {lastUpdated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live · {lastUpdated}
        </motion.div>
      )}
    </header>
  );
}
