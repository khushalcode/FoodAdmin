"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Store, PanelLeftClose, PanelLeft, LogOut, Star, Wallet } from "lucide-react";
import { VENDOR_NAV_ITEMS, VENDOR_NAV_GROUPS } from "./vendor-nav-config";
import type { AuthVendor } from "../login-page";
import { cn } from "@/lib/utils";

interface VendorSidebarProps {
  vendor: AuthVendor | null;
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function VendorSidebar({
  vendor,
  activeTab,
  onTabChange,
  onLogout,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: VendorSidebarProps) {
  const handleSelect = (id: string) => {
    onTabChange(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed lg:sticky top-0 z-40 h-screen bg-white border-r border-[#E5E7EB] flex flex-col transition-[width,transform] duration-300 ease-out",
          collapsed ? "lg:w-[76px]" : "lg:w-[260px]",
          "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB]/70 shrink-0">
          <div className={cn("flex items-center gap-2.5 overflow-hidden", collapsed && "lg:justify-center lg:w-full")}>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm overflow-hidden">
              <img src="/vendor-logo.png" alt="FoodHub Vendor" className="w-full h-full object-contain" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex flex-col leading-none"
                >
                  <span className="text-lg font-bold text-[#111827] truncate max-w-[150px]">
                    {vendor?.storeName || "FoodHub"}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] font-medium tracking-wide uppercase">Vendor Panel</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Vendor quick stats */}
        {!collapsed && vendor && (
          <div className="px-3 pt-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                  <span className="text-[#6B7280]">rating</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="font-semibold">${vendor.balance.toFixed(0)}</span>
                </div>
              </div>
              {vendor.isVerified ? (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verified Store
                </div>
              ) : (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending Verification
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-5">
          {VENDOR_NAV_GROUPS.map((group) => {
            const items = VENDOR_NAV_ITEMS.filter((i) => i.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="space-y-1">
                <AnimatePresence>
                  {!collapsed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
                    >
                      {group}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group relative w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
                          collapsed ? "lg:justify-center lg:px-0 px-3 py-2.5" : "px-3 py-2.5",
                          active
                            ? "bg-[#EFF6FF] text-primary"
                            : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="vendor-sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Icon
                          className={cn(
                            "w-[18px] h-[18px] shrink-0 transition-colors",
                            active ? "text-primary" : "text-[#9CA3AF] group-hover:text-[#6B7280]",
                          )}
                          strokeWidth={2}
                        />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -4 }}
                              className="truncate"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 shrink-0">
          <button
            onClick={onLogout}
            className={cn(
              "mt-2 w-full flex items-center gap-3 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors",
              collapsed ? "lg:justify-center px-3 py-2.5" : "px-3 py-2.5",
            )}
            title="Logout"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
