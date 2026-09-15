"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AlertTriangle, Save, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface MaintenanceConfig {
  isEnabled: boolean;
  message: string;
  scheduledUntil: string | null;
  updatedAt: string | null;
}

const FALLBACK: MaintenanceConfig = {
  isEnabled: false,
  message: "We're performing scheduled maintenance. We'll be back shortly.",
  scheduledUntil: null,
  updatedAt: null,
};

export default function MaintenancePage() {
  const [config, setConfig] = useState<MaintenanceConfig>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/maintenance-mode", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setConfig({
        isEnabled: !!json.isEnabled,
        message: json.message ?? "",
        scheduledUntil: json.scheduledUntil ?? null,
        updatedAt: json.updatedAt ?? null,
      });
      setDirty(false);
    } catch {
      setConfig(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const update = (patch: Partial<MaintenanceConfig>) => {
    setConfig((c) => ({ ...c, ...patch }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/maintenance-mode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled: config.isEnabled,
          message: config.message,
          scheduledUntil: config.scheduledUntil,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(config.isEnabled ? "Maintenance mode enabled" : "Maintenance mode disabled");
      setDirty(false);
      await fetchConfig();
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
          <h1 className="text-2xl font-bold text-foreground">Maintenance Mode</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Take the platform offline temporarily for maintenance. Customers will see the maintenance message instead of the app.
          </p>
        </div>
      </div>

      {loading ? (
        <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft">
          <CardContent className="py-8">
            <Skeleton className="h-32 w-full rounded-lg" />
          </CardContent>
        </Card>
      ) : (
        <>
          {config.isEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">Maintenance mode is currently ENABLED</p>
                    <p className="text-sm text-amber-800">
                      Customers cannot place orders or access the app until this is disabled.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center text-slate-700">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle>Maintenance Configuration</CardTitle>
                    <CardDescription>
                      {config.updatedAt
                        ? `Last updated: ${new Date(config.updatedAt).toLocaleString()}`
                        : "Never configured"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Enable maintenance mode</p>
                    <p className="text-xs text-muted-foreground">
                      When enabled, customers see the maintenance message instead of the app.
                    </p>
                  </div>
                  <Switch
                    checked={config.isEnabled}
                    onCheckedChange={(c) => update({ isEnabled: c })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="m-msg">Maintenance message</Label>
                  <Textarea
                    id="m-msg"
                    value={config.message}
                    onChange={(e) => update({ message: e.target.value })}
                    rows={4}
                    placeholder="We're performing scheduled maintenance. We'll be back shortly."
                  />
                  <p className="text-xs text-muted-foreground">
                    This message is shown to customers and vendors when they try to access the app.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="m-until">Scheduled end time (optional)</Label>
                  <input
                    id="m-until"
                    type="datetime-local"
                    value={config.scheduledUntil ? config.scheduledUntil.slice(0, 16) : ""}
                    onChange={(e) =>
                      update({
                        scheduledUntil: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="w-full h-9 rounded-md border bg-transparent px-3 text-sm"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={save}
                    disabled={!dirty || saving}
                    className="bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90 text-white"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    {saving ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
