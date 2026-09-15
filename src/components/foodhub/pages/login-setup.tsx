"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Chrome,
  Facebook,
  Apple,
  KeyRound,
  RefreshCw,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface LoginProvider {
  id: string;
  provider: string;
  isEnabled: boolean;
  clientId: string | null;
  clientSecret: string | null;
  redirectUrl: string | null;
}

const FALLBACK: LoginProvider[] = [
  { id: "1", provider: "email", isEnabled: true, clientId: null, clientSecret: null, redirectUrl: null },
  { id: "2", provider: "phone", isEnabled: true, clientId: null, clientSecret: null, redirectUrl: null },
  { id: "3", provider: "google", isEnabled: false, clientId: "", clientSecret: "", redirectUrl: "/auth/google/callback" },
  { id: "4", provider: "facebook", isEnabled: false, clientId: "", clientSecret: "", redirectUrl: "/auth/facebook/callback" },
  { id: "5", provider: "apple", isEnabled: false, clientId: "", clientSecret: "", redirectUrl: "/auth/apple/callback" },
];

const ICON_MAP: Record<string, any> = {
  email: Mail,
  phone: Phone,
  google: Chrome,
  facebook: Facebook,
  apple: Apple,
};

const COLOR_MAP: Record<string, string> = {
  email: "from-blue-100 to-indigo-100 text-blue-600",
  phone: "from-emerald-100 to-green-100 text-emerald-600",
  google: "from-red-100 to-rose-100 text-red-600",
  facebook: "from-blue-100 to-cyan-100 text-blue-700",
  apple: "from-gray-100 to-slate-100 text-slate-700",
};

const isOAuth = (provider: string) =>
  ["google", "facebook", "apple"].includes((provider || "").toLowerCase());

export default function LoginSetupPage() {
  const [providers, setProviders] = useState<LoginProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/login-setups", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.items ?? []);
      const mapped: LoginProvider[] = arr.map((p: any) => ({
        id: String(p.id),
        provider: p.provider ?? "",
        isEnabled: !!p.isEnabled,
        clientId: p.clientId ?? null,
        clientSecret: p.clientSecret ?? null,
        redirectUrl: p.redirectUrl ?? null,
      }));
      setProviders(mapped.length > 0 ? mapped : FALLBACK);
    } catch {
      setProviders(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const updateField = (id: string, field: keyof LoginProvider, value: any) => {
    setProviders((arr) =>
      arr.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
    setDirtyIds((s) => new Set(s).add(id));
  };

  const save = async (p: LoginProvider) => {
    setSavingId(p.id);
    try {
      const res = await fetch("/api/login-setups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          isEnabled: p.isEnabled,
          clientId: p.clientId,
          clientSecret: p.clientSecret,
          redirectUrl: p.redirectUrl,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(`${p.provider} settings saved`);
      setDirtyIds((s) => {
        const n = new Set(s);
        n.delete(p.id);
        return n;
      });
    } catch (e: any) {
      toast.error(`Failed to save: ${e.message}`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Login Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure customer login providers — email/phone, plus OAuth providers (Google, Facebook, Apple).
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchProviders}
          className="h-9 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p, i) => {
            const Icon = ICON_MAP[p.provider] || KeyRound;
            const color = COLOR_MAP[p.provider] || "from-gray-100 to-slate-100 text-slate-600";
            const oauth = isOAuth(p.provider);
            const dirty = dirtyIds.has(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base capitalize">{p.provider}</CardTitle>
                          <CardDescription className="text-xs">
                            {oauth ? "OAuth provider" : "Credential-based login"}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={p.isEnabled}
                        onCheckedChange={(c) => updateField(p.id, "isEnabled", c)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {oauth ? (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor={`cid-${p.id}`}>Client ID</Label>
                          <Input
                            id={`cid-${p.id}`}
                            value={p.clientId ?? ""}
                            onChange={(e) => updateField(p.id, "clientId", e.target.value)}
                            placeholder="1234567890-abc.apps.googleusercontent.com"
                            className="font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`cs-${p.id}`}>Client Secret</Label>
                          <Input
                            id={`cs-${p.id}`}
                            type="password"
                            value={p.clientSecret ?? ""}
                            onChange={(e) => updateField(p.id, "clientSecret", e.target.value)}
                            placeholder="••••••••••••"
                            className="font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`ru-${p.id}`}>Redirect URL</Label>
                          <Input
                            id={`ru-${p.id}`}
                            value={p.redirectUrl ?? ""}
                            onChange={(e) => updateField(p.id, "redirectUrl", e.target.value)}
                            placeholder="/auth/google/callback"
                            className="font-mono text-xs"
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">
                        Customers log in with their {p.provider}. No additional configuration required.
                      </p>
                    )}
                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        onClick={() => save(p)}
                        disabled={!dirty || savingId === p.id}
                        className="bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90 text-white h-8"
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        {savingId === p.id ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
