"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, RefreshCw, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingItem {
  id: string;
  key: string;
  value: string | null;
  dataType: string | null;
  description: string | null;
  isActive: boolean;
}

const FALLBACK_SETTINGS: SettingItem[] = [
  { id: "1", key: "business_name", value: "FoodHub", dataType: "string", description: "Public business name", isActive: true },
  { id: "2", key: "support_email", value: "support@foodhub.com", dataType: "string", description: "Customer support email", isActive: true },
  { id: "3", key: "support_phone", value: "+1 555-0100", dataType: "string", description: "Customer support phone", isActive: true },
  { id: "4", key: "currency_symbol", value: "$", dataType: "string", description: "Default currency symbol", isActive: true },
  { id: "5", key: "default_language", value: "en", dataType: "string", description: "Default app language", isActive: true },
  { id: "6", key: "timezone", value: "UTC", dataType: "string", description: "Default timezone", isActive: true },
  { id: "7", key: "min_order_amount", value: "10", dataType: "number", description: "Minimum order amount", isActive: true },
  { id: "8", key: "max_delivery_distance_km", value: "30", dataType: "number", description: "Max delivery distance", isActive: true },
  { id: "9", key: "vendor_commission_percent", value: "15", dataType: "number", description: "Vendor commission rate", isActive: true },
  { id: "10", key: "maintenance_mode", value: "false", dataType: "boolean", description: "Toggle maintenance mode", isActive: false },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business-settings", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.items ?? []);
      const mapped: SettingItem[] = arr.map((s: any) => ({
        id: String(s.id),
        key: s.key ?? "",
        value: s.value != null ? String(s.value) : "",
        dataType: s.dataType ?? null,
        description: s.description ?? null,
        isActive: !!s.isActive,
      }));
      setSettings(mapped.length > 0 ? mapped : FALLBACK_SETTINGS);
      setDirty(false);
    } catch {
      setSettings(FALLBACK_SETTINGS);
      setDirty(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateValue = (key: string, value: string) => {
    setSettings((arr) =>
      arr.map((s) => (s.key === key ? { ...s, value } : s)),
    );
    setDirty(true);
  };

  const toggleActive = (key: string) => {
    setSettings((arr) =>
      arr.map((s) => (s.key === key ? { ...s, isActive: !s.isActive } : s)),
    );
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const items = settings.map((s) => ({ key: s.key, value: s.value }));
      const res = await fetch("/api/business-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Settings saved");
      setDirty(false);
    } catch (e: any) {
      toast.error(`Failed to save: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform-wide key/value configuration. Changes apply immediately when saved.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            className="h-9 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={save}
            disabled={!dirty || saving}
            className="h-9 rounded-lg bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90 text-white"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-indigo-700">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>
                  {settings.length} settings · {dirty ? "unsaved changes" : "all changes saved"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">All Settings</CardTitle>
          <CardDescription>Edit values inline. Toggling Active disables the setting without deleting it.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {settings.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-12 gap-3 items-center rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="col-span-12 md:col-span-4">
                    <p className="font-mono text-xs font-semibold text-foreground">{s.key}</p>
                    {s.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                    )}
                  </div>
                  <div className="col-span-9 md:col-span-7">
                    {s.dataType === "boolean" ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={s.value === "true"}
                          onCheckedChange={(c) => updateValue(s.key, c ? "true" : "false")}
                        />
                        <span className="text-xs text-muted-foreground">
                          {s.value === "true" ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    ) : (
                      <Input
                        value={s.value ?? ""}
                        onChange={(e) => updateValue(s.key, e.target.value)}
                        type={s.dataType === "number" ? "number" : "text"}
                        className="h-9"
                      />
                    )}
                  </div>
                  <div className="col-span-3 md:col-span-1 flex justify-end">
                    <Switch checked={s.isActive} onCheckedChange={() => toggleActive(s.key)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
