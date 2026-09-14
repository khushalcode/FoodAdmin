"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import DashboardHome from "./pages/dashboard-home";
import { NAV_ITEMS } from "./nav-config";
import type { AuthUser } from "./login-page";

// import all pages
import CategoriesPage from "./pages/categories";
import SubCategoriesPage from "./pages/sub-categories";
import DishesPage from "./pages/dishes";
import AttributesPage from "./pages/attributes";
import BrandsPage from "./pages/brands";
import UnitsPage from "./pages/units";
import OrdersPage from "./pages/orders";
import PosPage from "./pages/pos";
import PosOrdersPage from "./pages/pos-orders";
import FlashSalesPage from "./pages/flash-sales";
import CampaignsPage from "./pages/campaigns";
import CouponsPage from "./pages/coupons";
import BannersPage from "./pages/banners";
import OtherBannersPage from "./pages/other-banners";
import PromotionsPage from "./pages/promotions";
import RestaurantsPage from "./pages/restaurants";
import RestaurantCategoriesPage from "./pages/restaurant-categories";
import RestaurantApplicationsPage from "./pages/restaurant-applications";
import PayoutRequestsPage from "./pages/payout-requests";
import StoreDisbursementsPage from "./pages/store-disbursements";
import CustomersPage from "./pages/customers";
import ProCustomersPage from "./pages/pro-customers";
import CustomerWalletPage from "./pages/customer-wallet";
import WalletBonusPage from "./pages/wallet-bonus";
import LoyaltyPointsPage from "./pages/loyalty-points";
import DeliveryBoysPage from "./pages/delivery-boys";
import VehiclesPage from "./pages/vehicles";
import DmEarningsPage from "./pages/dm-earnings";
import DmDisbursementsPage from "./pages/dm-disbursements";
import TrackDeliveryBoyPage from "./pages/track-delivery-boy";
import ReportsOverviewPage from "./pages/reports-overview";
import EarningReportsPage from "./pages/earning-reports";
import TaxReportsPage from "./pages/tax-reports";
import TransactionsPage from "./pages/transactions";
import DmEarningReportsPage from "./pages/dm-earning-reports";
import AiAssistantPage from "./pages/ai-assistant";
import BusinessSettingsPage from "./pages/business-settings";
import NotificationsPage from "./pages/notifications";
import MessagesPage from "./pages/messages";
import ModulesPage from "./pages/modules";
import TaxModulePage from "./pages/tax-module";
import ReelsPage from "./pages/reels";
import RideSharePage from "./pages/ride-share";
import RentalPage from "./pages/rental";
import ParcelCategoriesPage from "./pages/parcel-categories";
import ParcelOrdersPage from "./pages/parcel-orders";
import ParcelDispatchPage from "./pages/parcel-dispatch";
import BuilderPage from "./pages/builder";
import SettingsPage from "./pages/settings";
import PagesPage from "./pages/pages";
import LoginSetupPage from "./pages/login-setup";
import LanguagesPage from "./pages/languages";
import RolesPage from "./pages/roles";
import EmployeesPage from "./pages/employees";
import ZonesPage from "./pages/zones";
import FileManagerPage from "./pages/file-manager";
import ExternalConfigPage from "./pages/external-config";
import MaintenancePage from "./pages/maintenance";
import AddonsPage from "./pages/addons";
import AddonActivationPage from "./pages/addon-activation";

interface DashboardProps {
  user: AuthUser;
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
}

export default function Dashboard({ user, activeTab, onTabChange, onLogout }: DashboardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);

  const currentNav = NAV_ITEMS.find((i) => i.id === activeTab) || NAV_ITEMS[0];
  const subtitle = `Welcome back, ${user.name.split(" ")[0]} — here's what's happening with your food business today.`;

  function renderPage() {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome onLastUpdated={setLastUpdated} />;
      case "categories":
        return <CategoriesPage />;
      case "sub-categories":
        return <SubCategoriesPage />;
      case "dishes":
        return <DishesPage />;
      case "attributes":
        return <AttributesPage />;
      case "brands":
        return <BrandsPage />;
      case "units":
        return <UnitsPage />;
      case "orders":
        return <OrdersPage />;
      case "pos":
        return <PosPage />;
      case "pos-orders":
        return <PosOrdersPage />;
      case "flash-sales":
        return <FlashSalesPage />;
      case "campaigns":
        return <CampaignsPage />;
      case "coupons":
        return <CouponsPage />;
      case "banners":
        return <BannersPage />;
      case "other-banners":
        return <OtherBannersPage />;
      case "promotions":
        return <PromotionsPage />;
      case "restaurants":
        return <RestaurantsPage />;
      case "restaurant-categories":
        return <RestaurantCategoriesPage />;
      case "restaurant-applications":
        return <RestaurantApplicationsPage />;
      case "payout-requests":
        return <PayoutRequestsPage />;
      case "store-disbursements":
        return <StoreDisbursementsPage />;
      case "customers":
        return <CustomersPage />;
      case "pro-customers":
        return <ProCustomersPage />;
      case "customer-wallet":
        return <CustomerWalletPage />;
      case "wallet-bonus":
        return <WalletBonusPage />;
      case "loyalty-points":
        return <LoyaltyPointsPage />;
      case "delivery-boys":
        return <DeliveryBoysPage />;
      case "vehicles":
        return <VehiclesPage />;
      case "dm-earnings":
        return <DmEarningsPage />;
      case "dm-disbursements":
        return <DmDisbursementsPage />;
      case "track-delivery-boy":
        return <TrackDeliveryBoyPage />;
      case "reports-overview":
        return <ReportsOverviewPage />;
      case "earning-reports":
        return <EarningReportsPage />;
      case "tax-reports":
        return <TaxReportsPage />;
      case "transactions":
        return <TransactionsPage />;
      case "dm-earning-reports":
        return <DmEarningReportsPage />;
      case "ai-assistant":
        return <AiAssistantPage />;
      case "business-settings":
        return <BusinessSettingsPage />;
      case "notifications":
        return <NotificationsPage />;
      case "messages":
        return <MessagesPage />;
      // Modules (restored)
      case "modules":
        return <ModulesPage />;
      case "tax-module":
        return <TaxModulePage />;
      case "reels":
        return <ReelsPage />;
      case "ride-share":
        return <RideSharePage />;
      case "rental":
        return <RentalPage />;
      case "parcel-categories":
        return <ParcelCategoriesPage />;
      case "parcel-orders":
        return <ParcelOrdersPage />;
      case "parcel-dispatch":
        return <ParcelDispatchPage />;
      case "builder":
        return <BuilderPage />;
      // Settings (restored)
      case "settings":
        return <SettingsPage />;
      case "pages":
        return <PagesPage />;
      case "login-setup":
        return <LoginSetupPage />;
      case "languages":
        return <LanguagesPage />;
      case "roles":
        return <RolesPage />;
      case "employees":
        return <EmployeesPage />;
      case "zones":
        return <ZonesPage />;
      case "file-manager":
        return <FileManagerPage />;
      case "external-config":
        return <ExternalConfigPage />;
      case "maintenance":
        return <MaintenancePage />;
      case "addons":
        return <AddonsPage />;
      case "addon-activation":
        return <AddonActivationPage />;
      default:
        return <DashboardHome onLastUpdated={setLastUpdated} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={user}
          title={currentNav.label}
          subtitle={subtitle}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          lastUpdated={lastUpdated}
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
