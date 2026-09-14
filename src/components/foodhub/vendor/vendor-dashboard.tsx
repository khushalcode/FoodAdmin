"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VendorSidebar from "./vendor-sidebar";
import VendorTopbar from "./vendor-topbar";
import VendorHome from "./vendor-pages/vendor-home";
import VendorOrders from "./vendor-pages/vendor-orders";
import VendorPos from "./vendor-pages/vendor-pos";
import VendorProducts from "./vendor-pages/vendor-products";
import VendorAddProduct from "./vendor-pages/vendor-add-product";
import VendorReviews from "./vendor-pages/vendor-reviews";
import VendorEarnings from "./vendor-pages/vendor-earnings";
import VendorWithdrawals from "./vendor-pages/vendor-withdrawals";
import VendorStoreProfile from "./vendor-pages/vendor-store-profile";
import VendorCampaigns from "./vendor-pages/vendor-campaigns";
import VendorNotifications from "./vendor-pages/vendor-notifications";
import VendorMessages from "./vendor-pages/vendor-messages";
import { VENDOR_NAV_ITEMS } from "./vendor-nav-config";
import type { AuthUser, AuthVendor } from "../login-page";

interface VendorDashboardProps {
  user: AuthUser;
  vendor: AuthVendor | null;
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
}

export default function VendorDashboard({
  user,
  vendor,
  activeTab,
  onTabChange,
  onLogout,
}: VendorDashboardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);

  const currentNav = VENDOR_NAV_ITEMS.find((i) => i.id === activeTab) || VENDOR_NAV_ITEMS[0];
  const subtitle = vendor
    ? `Welcome back, ${user.name.split(" ")[0]} — here's how ${vendor.storeName} is doing today.`
    : `Welcome back, ${user.name.split(" ")[0]}.`;

  function renderPage() {
    switch (activeTab) {
      case "dashboard":
        return <VendorHome vendor={vendor} onLastUpdated={setLastUpdated} />;
      case "orders":
        return <VendorOrders vendor={vendor} />;
      case "pos":
        return <VendorPos vendor={vendor} />;
      case "products":
        return <VendorProducts vendor={vendor} />;
      case "add-product":
        return <VendorAddProduct vendor={vendor} />;
      case "reviews":
        return <VendorReviews vendor={vendor} />;
      case "earnings":
        return <VendorEarnings vendor={vendor} />;
      case "withdrawals":
        return <VendorWithdrawals vendor={vendor} />;
      case "store-profile":
        return <VendorStoreProfile vendor={vendor} />;
      case "campaigns":
        return <VendorCampaigns />;
      case "notifications":
        return <VendorNotifications />;
      case "messages":
        return <VendorMessages />;
      default:
        return <VendorHome vendor={vendor} onLastUpdated={setLastUpdated} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <VendorSidebar
        vendor={vendor}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <VendorTopbar
          user={user}
          vendor={vendor}
          title={currentNav.label}
          subtitle={subtitle}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          lastUpdated={lastUpdated}
          onLogout={onLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
