"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, PanelLeftClose, PanelLeft, LogOut, Sparkles } from "lucide-react";
import { NAV_ITEMS, NAV_GROUPS } from "./nav-config";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
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
              <img src="/admin-logo.png" alt="FoodHub Admin" className="w-full h-full object-contain" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex flex-col leading-none"
                >
                  <span className="text-lg font-bold text-[#111827]">FoodHub</span>
                  <span className="text-[10px] text-[#9CA3AF] font-medium tracking-wide uppercase">Admin Panel</span>
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

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group);
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
                            layoutId="sidebar-active"
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

        {/* Premium CTA */}
        <div className="p-3 shrink-0">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.button
                key="collapsed-cta"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full gradient-premium rounded-xl p-3 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow"
                onClick={() => onTabChange("business-settings")}
                title="Upgrade to Premium"
              >
                <Sparkles className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.div
                key="expanded-cta"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="gradient-premium rounded-xl p-4 text-white relative overflow-hidden shadow-md"
              >
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Premium</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug mb-2.5">
                    Unlock advanced analytics & AI insights
                  </p>
                  <button
                    onClick={() => onTabChange("business-settings")}
                    className="w-full bg-white text-blue-700 hover:bg-blue-50 transition-colors text-xs font-semibold py-2 rounded-lg"
                  >
                    Upgrade now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout */}
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
