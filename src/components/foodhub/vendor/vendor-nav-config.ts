import {
  LayoutDashboard,
  ShoppingBag,
  Calculator,
  UtensilsCrossed,
  Plus,
  Star,
  DollarSign,
  HandCoins,
  Store,
  Megaphone,
  Bell,
  Mail,
  type LucideIcon,
} from "lucide-react";

export interface VendorNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

export const VENDOR_NAV_ITEMS: VendorNavItem[] = [
  // Main
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Main" },
  // Orders
  { id: "orders", label: "Orders", icon: ShoppingBag, group: "Orders" },
  { id: "pos", label: "POS", icon: Calculator, group: "Orders" },
  // Menu
  { id: "products", label: "Products", icon: UtensilsCrossed, group: "Menu" },
  { id: "add-product", label: "Add Product", icon: Plus, group: "Menu" },
  // Reviews
  { id: "reviews", label: "Reviews", icon: Star, group: "Reviews" },
  // Finance
  { id: "earnings", label: "Earnings", icon: DollarSign, group: "Finance" },
  { id: "withdrawals", label: "Withdrawals", icon: HandCoins, group: "Finance" },
  // Store
  { id: "store-profile", label: "Store Profile", icon: Store, group: "Store" },
  { id: "campaigns", label: "Campaigns", icon: Megaphone, group: "Store" },
  // Settings
  { id: "notifications", label: "Notifications", icon: Bell, group: "Settings" },
  { id: "messages", label: "Messages", icon: Mail, group: "Settings" },
];

export const VENDOR_NAV_GROUPS = [
  "Main",
  "Orders",
  "Menu",
  "Reviews",
  "Finance",
  "Store",
  "Settings",
];
