"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, CreditCard, Bell, Globe, ShieldCheck, Truck } from "lucide-react";
import { PageHeader, ContentCard } from "../shared/list-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SECTIONS = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "localization", label: "Localization", icon: Globe },
  { id: "security", label: "Security", icon: ShieldCheck },
];

export default function BusinessSettingsPage() {
  const [active, setActive] = useState("business");
  const [businessName, setBusinessName] = useState("FoodHub Inc.");
  const [supportEmail, setSupportEmail] = useState("support@foodhub.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [address, setAddress] = useState("123 Food Street, New York, NY 10001");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en");
  const [taxRate, setTaxRate] = useState("8");
  const [commission, setCommission] = useState("10");
  const [autoApprove, setAutoApprove] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  const save = () => toast.success("Settings saved successfully!", { description: "Changes will take effect immediately." });

  return (
    <div>
      <PageHeader
        title="Business Settings"
        description="Configure your FoodHub platform preferences"
        actionLabel="Save Changes"
        onAction={save}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Section nav */}
        <ContentCard className="p-2 h-fit">
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active === s.id ? "bg-[#EFF6FF] text-primary" : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </ContentCard>

        {/* Section content */}
        <div className="lg:col-span-3 space-y-4">
          {active === "business" && (
            <ContentCard className="p-6">
              <h3 className="text-base font-semibold text-[#111827]">Business Information</h3>
              <p className="text-xs text-[#6B7280] mt-0.5 mb-5">Basic details about your food business</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bn">Business Name</Label>
                  <Input id="bn" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="se">Support Email</Label>
                  <Input id="se" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ph">Phone Number</Label>
                  <Input id="ph" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="addr">Address</Label>
                  <Input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD — US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR — Euro</SelectItem>
                      <SelectItem value="GBP">GBP — British Pound</SelectItem>
                      <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                      <SelectItem value="AED">AED — UAE Dirham</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-[#F3F4F6] flex items-center gap-2">
                <Button onClick={save} className="bg-primary hover:bg-blue-700 text-white">Save Changes</Button>
                <Button variant="outline" className="border-[#E5E7EB]">Cancel</Button>
              </div>
            </ContentCard>
          )}

          {active === "payments" && (
            <ContentCard className="p-6">
              <h3 className="text-base font-semibold text-[#111827]">Payments & Commissions</h3>
              <p className="text-xs text-[#6B7280] mt-0.5 mb-5">Tax rates, commission and payout settings</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="space-y-1.5">
                  <Label htmlFor="tr">Default Tax Rate (%)</Label>
                  <Input id="tr" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cm">Platform Commission (%)</Label>
                  <Input id="cm" type="number" value={commission} onChange={(e) => setCommission(e.target.value)} className="h-10 rounded-lg" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]">
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Auto-approve Restaurant Payouts</p>
                    <p className="text-xs text-[#6B7280]">Skip manual approval for payouts below $500</p>
                  </div>
                  <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]">
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Accepted Payment Methods</p>
                    <p className="text-xs text-[#6B7280]">Card, Wallet, PayPal, Cash, Stripe</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-[#E5E7EB]" onClick={() => toast.info("Opening payment methods...")}>Manage</Button>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-[#F3F4F6] flex items-center gap-2">
                <Button onClick={save} className="bg-primary hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </ContentCard>
          )}

          {active === "delivery" && (
            <ContentCard className="p-6">
              <h3 className="text-base font-semibold text-[#111827]">Delivery Settings</h3>
              <p className="text-xs text-[#6B7280] mt-0.5 mb-5">Configure delivery fees, radius, and rider rules</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fee">Default Delivery Fee ($)</Label>
                  <Input id="fee" defaultValue="2.99" className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rad">Delivery Radius (km)</Label>
                  <Input id="rad" defaultValue="10" className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="min">Minimum Order Value ($)</Label>
                  <Input id="min" defaultValue="10" className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="etp">Estimated Prep Time (min)</Label>
                  <Input id="etp" defaultValue="20" className="h-10 rounded-lg" />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="policy">Delivery Policy</Label>
                <Textarea id="policy" rows={4} defaultValue="Free delivery on orders over $25. Express delivery (under 30 min) available for +$3." className="rounded-lg mt-1.5" />
              </div>
              <div className="mt-5 pt-5 border-t border-[#F3F4F6] flex items-center gap-2">
                <Button onClick={save} className="bg-primary hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </ContentCard>
          )}

          {active === "notifications" && (
            <ContentCard className="p-6">
              <h3 className="text-base font-semibold text-[#111827]">Notification Preferences</h3>
              <p className="text-xs text-[#6B7280] mt-0.5 mb-5">Choose how you want to be notified</p>
              <div className="space-y-3">
                {[
                  { label: "Email Notifications", desc: "Daily summaries, alerts via email", state: emailNotif, set: setEmailNotif },
                  { label: "SMS Notifications", desc: "Critical alerts via SMS", state: smsNotif, set: setSmsNotif },
                  { label: "Push Notifications", desc: "Real-time alerts on your devices", state: pushNotif, set: setPushNotif },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]">
                    <div>
                      <p className="text-sm font-medium text-[#111827]">{n.label}</p>
                      <p className="text-xs text-[#6B7280]">{n.desc}</p>
                    </div>
                    <Switch checked={n.state} onCheckedChange={n.set} />
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-[#F3F4F6] flex items-center gap-2">
                <Button onClick={save} className="bg-primary hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </ContentCard>
          )}

          {active === "localization" && (
            <ContentCard className="p-6">
              <h3 className="text-base font-semibold text-[#111827]">Localization</h3>
              <p className="text-xs text-[#6B7280] mt-0.5 mb-5">Language & region settings</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Default Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date Format</Label>
                  <Select defaultValue="MDY">
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MDY">MM/DD/YYYY (US)</SelectItem>
                      <SelectItem value="DMY">DD/MM/YYYY (EU)</SelectItem>
                      <SelectItem value="YMD">YYYY-MM-DD (ISO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Time Format</Label>
                  <Select defaultValue="24">
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24-hour</SelectItem>
                      <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Distance Unit</Label>
                  <Select defaultValue="km">
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Kilometers</SelectItem>
                      <SelectItem value="mi">Miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-[#F3F4F6] flex items-center gap-2">
                <Button onClick={save} className="bg-primary hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </ContentCard>
          )}

          {active === "security" && (
            <ContentCard className="p-6">
              <h3 className="text-base font-semibold text-[#111827]">Security & Access</h3>
              <p className="text-xs text-[#6B7280] mt-0.5 mb-5">Protect your admin account</p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cp">Change Password</Label>
                  <Input id="cp" type="password" placeholder="Enter new password" className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cp2">Confirm Password</Label>
                  <Input id="cp2" type="password" placeholder="Re-enter new password" className="h-10 rounded-lg" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]">
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Two-Factor Authentication</p>
                    <p className="text-xs text-[#6B7280]">Add an extra layer of security</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                  <div>
                    <p className="text-sm font-medium text-amber-900">Maintenance Mode</p>
                    <p className="text-xs text-amber-700">Temporarily disable customer access</p>
                  </div>
                  <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-[#F3F4F6] flex items-center gap-2">
                <Button onClick={save} className="bg-primary hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </ContentCard>
          )}
        </div>
      </div>
    </div>
  );
}
