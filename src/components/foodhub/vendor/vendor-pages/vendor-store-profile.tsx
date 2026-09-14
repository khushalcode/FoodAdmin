"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Store, Phone, Mail, MapPin, Clock, Percent, Save, Loader2, Star, BadgeCheck } from "lucide-react";
import { PageHeader, ContentCard } from "../../shared/list-page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePoll } from "../use-vendor-data";
import type { AuthVendor } from "../../login-page";

interface VendorStoreProfileProps {
  vendor: AuthVendor | null;
}

interface VendorProfileData {
  vendor: {
    id: string;
    storeName: string;
    slug: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    openTime: string;
    closeTime: string;
    commissionPct: number;
    balance: number;
    owner: string;
    ownerEmail: string;
  };
}

export default function VendorStoreProfile({ vendor }: VendorStoreProfileProps) {
  const url = vendor ? `/api/vendor/dashboard?vendorId=${vendor.id}` : null;
  const { data, loading } = usePoll<VendorProfileData>(url, 10000);

  const v = data?.vendor;
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form fields once data arrives
  if (v && !initialized) {
    setStoreName(v.storeName);
    setDescription(v.description || "");
    setPhone(v.phone || "");
    setEmail(v.email || "");
    setAddress(v.address || "");
    setCity(v.city || "");
    setOpenTime(v.openTime);
    setCloseTime(v.closeTime);
    setInitialized(true);
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Changes saved (demo)", {
        description: "Store profile updated successfully.",
      });
    }, 800);
  };

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-[600px] rounded-2xl" />
      </div>
    );
  }

  if (!v) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#6B7280]">No store data available.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Store Profile"
        description="Manage your store information, hours, and contact details"
        actionLabel="Save Changes"
        onAction={() => toast.success("Changes saved (demo)")}
      />

      {/* Header banner */}
      <ContentCard className="overflow-hidden mb-5">
        <div className="relative h-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-end p-5">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-primary">
              <Store className="w-8 h-8" />
            </div>
            <div className="text-white">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{v.storeName}</h2>
                {v.isVerified ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <BadgeCheck className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    Pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  {v.rating.toFixed(1)} ({v.reviewCount} reviews)
                </span>
                <span className="opacity-70">·</span>
                <span>Commission: {v.commissionPct}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
          <div className="text-center">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">Owner</p>
            <p className="text-sm font-semibold text-[#111827] mt-1">{v.owner}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">Owner Email</p>
            <p className="text-sm font-semibold text-[#111827] mt-1 truncate">{v.ownerEmail}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">Slug</p>
            <p className="text-sm font-semibold text-[#111827] mt-1">{v.slug}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">Balance</p>
            <p className="text-sm font-bold text-emerald-600 mt-1">${v.balance.toFixed(2)}</p>
          </div>
        </div>
      </ContentCard>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Basic info */}
        <ContentCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#111827]">Basic Information</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Your store name and description</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="storeName" className="text-[#374151] text-sm font-medium">Store Name</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[#374151] text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your store..."
                className="min-h-[120px] rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary text-sm"
              />
            </div>
          </div>
        </ContentCard>

        {/* Contact info */}
        <ContentCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#111827]">Contact Information</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">How customers can reach you</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[#374151] text-sm font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" /> Phone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#374151] text-sm font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="store@foodhub.com"
                className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-[#374151] text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" /> Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street"
                className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-[#374151] text-sm font-medium">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
                className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
          </div>
        </ContentCard>

        {/* Hours & commission */}
        <ContentCard className="overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#111827]">Operating Hours & Commission</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">When customers can place orders</p>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="openTime" className="text-[#374151] text-sm font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" /> Opening Time
              </Label>
              <Input
                id="openTime"
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="closeTime" className="text-[#374151] text-sm font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" /> Closing Time
              </Label>
              <Input
                id="closeTime"
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#374151] text-sm font-medium flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-[#9CA3AF]" /> Commission Rate
              </Label>
              <div className="h-11 px-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center text-sm font-semibold text-[#111827]">
                {v.commissionPct}%
                <span className="ml-auto text-xs font-normal text-[#9CA3AF]">set by admin</span>
              </div>
            </div>
          </div>
          <div className="p-5 pt-0 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setInitialized(false);
                toast.info("Reverted changes");
              }}
              className="h-11 px-5 rounded-lg border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-11 px-6 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold text-sm shadow-sm disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </ContentCard>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-center text-xs text-[#9CA3AF]"
      >
        Last synced with database {new Date().toLocaleTimeString("en-US", { hour12: false })}
      </motion.div>
    </div>
  );
}
