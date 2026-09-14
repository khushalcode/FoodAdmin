"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChefHat,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  Shield,
  Store,
  User,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export type Role = "admin" | "vendor" | "customer" | "delivery";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  avatar: string | null;
}

export interface AuthVendor {
  id: string;
  storeName: string;
  slug: string;
  rating: number;
  balance: number;
  isVerified: boolean;
}

interface LoginPageProps {
  onLogin: (user: AuthUser, vendor: AuthVendor | null) => void;
}

const ROLE_OPTIONS: {
  value: Role;
  label: string;
  icon: LucideIcon;
  email: string;
  password: string;
}[] = [
  { value: "admin", label: "Admin", icon: Shield, email: "admin1@example.com", password: "admin123" },
  { value: "vendor", label: "Vendor", icon: Store, email: "vendor1@demo.com", password: "Vendor@1234" },
  { value: "customer", label: "Customer", icon: User, email: "customer1@demo.com", password: "Customer@1234" },
  { value: "delivery", label: "Delivery Boy", icon: Bike, email: "dm1@demo.com", password: "Delivery@1234" },
];

const floatingIcons = [
  { Icon: ShoppingBag, x: "8%", y: "20%", delay: 0 },
  { Icon: UtensilsCrossed, x: "82%", y: "14%", delay: 1.2 },
  { Icon: Bike, x: "75%", y: "70%", delay: 0.6 },
  { Icon: ChefHat, x: "14%", y: "72%", delay: 1.8 },
  { Icon: Sparkles, x: "48%", y: "10%", delay: 0.9 },
  { Icon: UtensilsCrossed, x: "88%", y: "44%", delay: 1.5 },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("admin1@example.com");
  const [password, setPassword] = useState("admin123");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // When role changes, pre-fill credentials (unless user has manually typed something different)
  const handleRoleChange = (next: Role) => {
    const opt = ROLE_OPTIONS.find((o) => o.value === next);
    if (!opt) return;
    setRole(next);
    if (!emailTouched) setEmail(opt.email);
    if (!passwordTouched) setPassword(opt.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${data.user.name}!`, {
        description: `Signed in as ${data.user.role}.`,
      });
      onLogin(data.user as AuthUser, (data.vendor as AuthVendor) || null);
    } catch {
      toast.error("Network error — please try again");
      setLoading(false);
    }
  };

  const currentRoleOpt = ROLE_OPTIONS.find((o) => o.value === role)!;

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-[#F4F5F7]">
      {/* Left: Brand panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1E40AF 0%, #1E3A8A 60%, #1E1B4B 100%)" }}
      >
        {/* floating icons */}
        {floatingIcons.map(({ Icon, x, y, delay }, i) => (
          <motion.div
            key={i}
            className="absolute text-white/15"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -16, 0] }}
            transition={{
              opacity: { duration: 1, delay },
              y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay },
            }}
          >
            <Icon className="w-12 h-12" strokeWidth={1.5} />
          </motion.div>
        ))}

        {/* glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center overflow-hidden">
            <img src="/admin-logo.png" alt="FoodHub Admin" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-bold tracking-tight">FoodHub</span>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-4xl xl:text-5xl font-bold leading-tight mb-5"
          >
            The all-in-one platform for modern food businesses.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-blue-100/80 text-lg"
          >
            Admins, vendors, customers and delivery boys — every role, one
            unified workspace.
          </motion.p>

          <div className="mt-10 flex items-center gap-6">
            <div>
              <div className="text-3xl font-bold">1.2k+</div>
              <div className="text-blue-100/70 text-sm">Restaurants</div>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div>
              <div className="text-3xl font-bold">85k+</div>
              <div className="text-blue-100/70 text-sm">Orders / mo</div>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div>
              <div className="text-3xl font-bold">4.9</div>
              <div className="text-blue-100/70 text-sm">Avg rating</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-blue-100/60 text-sm">
          © 2025 FoodHub Inc. All rights reserved.
        </div>
      </motion.div>

      {/* Right: Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-soft border border-[#E5E7EB] p-8 sm:p-10">
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center overflow-hidden">
                <img src="/admin-logo.png" alt="FoodHub Admin" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-[#111827]">FoodHub</span>
            </div>

            <h2 className="text-2xl font-bold text-[#111827]">Welcome back</h2>
            <p className="text-sm text-[#6B7280] mt-1.5">
              Select your role and sign in to continue
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Role selector */}
              <div className="space-y-2">
                <Label className="text-[#374151] text-sm font-medium">Sign in as</Label>
                <div className="grid grid-cols-4 gap-2">
                  {ROLE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = role === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleRoleChange(opt.value)}
                        className={`relative flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${
                          active
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F9FAFB]"
                        }`}
                        aria-pressed={active}
                      >
                        <Icon className="w-4 h-4" strokeWidth={2} />
                        <span className="leading-none">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#374151] text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmailTouched(true);
                      setEmail(e.target.value);
                    }}
                    placeholder="you@foodhub.com"
                    className="pl-9 h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#374151] text-sm font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => toast.info("Password reset link sent (demo)")}
                    className="text-xs font-medium text-primary hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPasswordTouched(true);
                      setPassword(e.target.value);
                    }}
                    placeholder="••••••••"
                    className="pl-9 pr-10 h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" defaultChecked className="border-[#9CA3AF] data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <label htmlFor="remember" className="text-sm text-[#4B5563] cursor-pointer select-none">
                    Remember me
                  </label>
                </div>
                <span className="text-xs text-[#9CA3AF]">Need help?</span>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-80"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  `Sign in as ${currentRoleOpt.label}`
                )}
              </Button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                <Sparkles className="w-3 h-3" />
                Demo: {currentRoleOpt.email} / {currentRoleOpt.password}
              </span>
              <span className="text-[#9CA3AF]">
                Switch role above to auto-fill demo credentials
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-[#9CA3AF] mt-6">
            By signing in, you agree to our{" "}
            <span className="text-primary">Terms of Service</span> and{" "}
            <span className="text-primary">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
