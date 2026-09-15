import {
  LayoutDashboard,
  Folder,
  FolderTree,
  UtensilsCrossed,
  Tag,
  Bookmark,
  Ruler,
  ShoppingBag,
  Calculator,
  ListOrdered,
  Zap,
  Megaphone,
  Ticket,
  Image as ImageIcon,
  Images,
  Gift,
  Store,
  Layers,
  UserPlus,
  ArrowLeftRight,
  Coins,
  Users,
  Crown,
  Wallet,
  Wallet2,
  Star,
  Bike,
  Truck,
  TrendingUp,
  HandCoins,
  MapPin,
  ChartLine as ChartLineIcon,
  DollarSign,
  Receipt,
  ArrowRightLeft,
  Route,
  Bot,
  Cog,
  Bell,
  Mail,
  Puzzle,
  Percent,
  Film,
  Wrench,
  Sliders,
  FileText,
  LogIn,
  Languages,
  ShieldCheck,
  UserCog,
  Map,
  FolderOpen,
  Plug,
  Hammer,
  Key,
  Car,
  Package,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  // Main
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Main" },

  // Menu Management
  { id: "categories", label: "Categories", icon: Folder, group: "Menu Management" },
  { id: "sub-categories", label: "Sub Categories", icon: FolderTree, group: "Menu Management" },
  { id: "dishes", label: "Dishes", icon: UtensilsCrossed, group: "Menu Management" },
  { id: "attributes", label: "Attributes", icon: Tag, group: "Menu Management" },
  { id: "brands", label: "Brands", icon: Bookmark, group: "Menu Management" },
  { id: "units", label: "Units", icon: Ruler, group: "Menu Management" },

  // Orders & Sales
  { id: "orders", label: "Orders", icon: ShoppingBag, group: "Orders & Sales" },
  { id: "create-order", label: "Create Order", icon: ShoppingBag, group: "Orders & Sales" },
  { id: "pos", label: "POS", icon: Calculator, group: "Orders & Sales" },
  { id: "pos-orders", label: "POS Orders", icon: ListOrdered, group: "Orders & Sales" },
  { id: "flash-sales", label: "Flash Sales", icon: Zap, group: "Orders & Sales" },
  { id: "campaigns", label: "Campaigns", icon: Megaphone, group: "Orders & Sales" },
  { id: "coupons", label: "Coupons", icon: Ticket, group: "Orders & Sales" },
  { id: "banners", label: "Banners", icon: ImageIcon, group: "Orders & Sales" },
  { id: "other-banners", label: "Other Banners", icon: Images, group: "Orders & Sales" },
  { id: "promotions", label: "Promotions", icon: Gift, group: "Orders & Sales" },

  // Restaurants
  { id: "restaurants", label: "Restaurants", icon: Store, group: "Restaurants" },
  { id: "restaurant-categories", label: "Restaurant Categories", icon: Layers, group: "Restaurants" },
  { id: "restaurant-applications", label: "Restaurant Applications", icon: UserPlus, group: "Restaurants" },
  { id: "payout-requests", label: "Payout Requests", icon: ArrowLeftRight, group: "Restaurants" },
  { id: "store-disbursements", label: "Disbursements", icon: Coins, group: "Restaurants" },

  // Customers
  { id: "customers", label: "Customers", icon: Users, group: "Customers" },
  { id: "pro-customers", label: "Pro Customers", icon: Crown, group: "Customers" },
  { id: "customer-wallet", label: "Customer Wallet", icon: Wallet, group: "Customers" },
  { id: "wallet-bonus", label: "Wallet Bonus", icon: Wallet2, group: "Customers" },
  { id: "loyalty-points", label: "Loyalty Points", icon: Star, group: "Customers" },

  // Delivery Boys
  { id: "delivery-boys", label: "Delivery Boys", icon: Bike, group: "Delivery Boys" },
  { id: "vehicles", label: "Vehicles", icon: Truck, group: "Delivery Boys" },
  { id: "dm-earnings", label: "Earnings", icon: TrendingUp, group: "Delivery Boys" },
  { id: "dm-disbursements", label: "Disbursements (DM)", icon: HandCoins, group: "Delivery Boys" },
  { id: "track-delivery-boy", label: "Track Delivery Boy", icon: MapPin, group: "Delivery Boys" },

  // Reports
  { id: "reports-overview", label: "Reports Overview", icon: ChartLineIcon, group: "Reports" },
  { id: "earning-reports", label: "Earning Reports", icon: DollarSign, group: "Reports" },
  { id: "tax-reports", label: "Tax Reports", icon: Receipt, group: "Reports" },
  { id: "transactions", label: "Transactions", icon: ArrowRightLeft, group: "Reports" },
  { id: "dm-earning-reports", label: "DM Earnings Reports", icon: Route, group: "Reports" },

  // Modules (restored from old admin)
  { id: "modules", label: "Modules", icon: Puzzle, group: "Modules" },
  { id: "tax-module", label: "Tax Module", icon: Percent, group: "Modules" },
  { id: "reels", label: "Reels Module", icon: Film, group: "Modules" },
  { id: "ride-share", label: "Ride Share", icon: Car, group: "Modules" },
  { id: "rental", label: "Rental", icon: Package, group: "Modules" },
  { id: "parcel-categories", label: "Parcel Categories", icon: Folder, group: "Modules" },
  { id: "parcel-orders", label: "Parcel Orders", icon: ShoppingBag, group: "Modules" },
  { id: "parcel-dispatch", label: "Parcel Dispatch", icon: Truck, group: "Modules" },
  { id: "builder", label: "Page Builder", icon: Wrench, group: "Modules" },

  // Settings (restored from old admin)
  { id: "ai-assistant", label: "AI Assistant", icon: Bot, group: "Settings" },
  { id: "business-settings", label: "Business Settings", icon: Cog, group: "Settings" },
  { id: "settings", label: "System Settings", icon: Sliders, group: "Settings" },
  { id: "pages", label: "Pages Setup", icon: FileText, group: "Settings" },
  { id: "login-setup", label: "Login Setup", icon: LogIn, group: "Settings" },
  { id: "languages", label: "Languages", icon: Languages, group: "Settings" },
  { id: "roles", label: "Roles & Permissions", icon: ShieldCheck, group: "Settings" },
  { id: "employees", label: "Employees", icon: UserCog, group: "Settings" },
  { id: "zones", label: "Zones", icon: Map, group: "Settings" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Settings" },
  { id: "messages", label: "Messages", icon: Mail, group: "Settings" },
  { id: "file-manager", label: "File Manager", icon: FolderOpen, group: "Settings" },
  { id: "external-config", label: "External Config", icon: Plug, group: "Settings" },
  { id: "maintenance", label: "Maintenance Mode", icon: Hammer, group: "Settings" },
  { id: "addons", label: "Addons", icon: Puzzle, group: "Settings" },
  { id: "addon-activation", label: "Addon Activation", icon: Key, group: "Settings" },
];

export const NAV_GROUPS = [
  "Main",
  "Menu Management",
  "Orders & Sales",
  "Restaurants",
  "Customers",
  "Delivery Boys",
  "Reports",
  "Modules",
  "Settings",
];
